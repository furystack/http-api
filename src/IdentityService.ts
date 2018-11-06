import { Constructable, InMemoryStore, IPhysicalStore, IUser, LoggerCollection, visitorUser } from "@furystack/core";
import { Injector } from "@furystack/inject";
import { sha256 } from "hash.js";
import { IncomingMessage, ServerResponse } from "http";
import { v1 } from "uuid";
import { IExternalLoginService } from "./Models";
export type ILoginUser<T extends IUser> = T & { Password: string };

export interface IIdentityServiceOptions<TUser extends IUser> {
    users: IPhysicalStore<ILoginUser<TUser>>;
    cookieName: string;
    hashMethod: (plain: string) => string;
    injector: Injector;
}

export class IdentityService<TUser extends IUser = IUser> {

    public static LogScope = "@furystack/http-api/IdentityService";

    public readonly sessions: Map<string, number> = new Map();
    public async authenticateUser(userName: string, password: string): Promise<TUser> {
        const match = await this.options.users.filter({
            Username: userName,
            Password: this.options.hashMethod(password),
        } as Partial<ILoginUser<TUser>>);
        if (match.length === 1) {
            return match[0];
        }
        return visitorUser as TUser;
    }

    private getSessionIdFromRequest(req: IncomingMessage): string | null {
        if (req.headers.cookie) {
            /** */
            const cookies = req.headers.cookie.toString().split(";")
                .map((val) => {
                    const [name, value] = val.split("=");
                    return { name: name.trim(), value: value.trim() };
                });
            const sessionCookie = cookies.find((c) => c.name === this.options.cookieName);
            if (sessionCookie) {
                return sessionCookie.value;
            }
        }
        return null;
    }

    public async authenticateRequest(req: IncomingMessage): Promise<TUser> {
        // Basic auth
        if (req.headers.authorization) {
            const authData = Buffer.from(req.headers.authorization.toString().split(" ")[1], "base64");
            const [userName, password] = authData.toString().split(":");
            return await this.authenticateUser(userName, password);
        }

        // Cookie auth
        const sessionId = this.getSessionIdFromRequest(req);
        if (sessionId && this.sessions.has(sessionId)) {
            const userId = this.sessions.get(sessionId);
            return await this.options.users.get(userId as any) || visitorUser as TUser;
        }

        return visitorUser as TUser;
    }

    public async cookieLogin(username: string, password: string, serverResponse: ServerResponse): Promise<TUser> {
        const user = await this.authenticateUser(username, password);
        if (user !== visitorUser) {
            const sessionId = v1();
            this.sessions.set(sessionId, user.Id);
            serverResponse.setHeader("Set-Cookie", `${this.options.cookieName}=${sessionId}; Path=/; Secure; HttpOnly`);
        }
        return user;
    }

    public async externalLogin<T extends IExternalLoginService<TUser, TArgs>, TArgs extends any[]>(service: Constructable<T>, serverResponse: ServerResponse, ...args: TArgs): Promise<TUser> {
        try {
            const instance = this.options.injector.GetInstance(service);
            const user = await instance.login(this, ...args);
            if (user.Id !== visitorUser.Id) {
                const sessionId = v1();
                this.sessions.set(sessionId, user.Id);
                serverResponse.setHeader("Set-Cookie", `${this.options.cookieName}=${sessionId}; Path=/; Secure; HttpOnly`);
                this.options.injector.GetInstance(LoggerCollection).Verbose({
                    scope: IdentityService.LogScope,
                    message: `User '${user.Username}' logged in with '${service.name}' external service.`,
                    data: {
                        user,
                        sessionId,
                    },
                });
                return user;
            }
        } catch (error) {
            /** */
            this.options.injector.GetInstance(LoggerCollection).Error({
                scope: IdentityService.LogScope,
                message: `Error during external login with '${service.name}': ${error.message}`,
                data: {error},
            });
        }
        return visitorUser as TUser;
    }

    public async cookieLogout(req: IncomingMessage, serverResponse: ServerResponse) {
        const sessionId = this.getSessionIdFromRequest(req);
        if (sessionId) {
            const user = await this.authenticateRequest(req);
            this.sessions.delete(sessionId);
            serverResponse.setHeader("Set-Cookie", `${this.options.cookieName}=; Path=/; Secure; HttpOnly`);
            this.options.injector.GetInstance(LoggerCollection).Verbose({
                scope: IdentityService.LogScope,
                message: `User '${user.Username}' has been logged out.`,
                data: {
                    user,
                    sessionId,
                },
            });
        }
    }

    public readonly options: IIdentityServiceOptions<TUser> = {
        users: new InMemoryStore<ILoginUser<TUser>>("", "Id"),
        cookieName: "fss",
        hashMethod: (plain) => sha256().update(plain).digest("hex"),
        injector: Injector.Default,
    };

    constructor(options?: Partial<IdentityService<TUser>["options"]>) {
        this.options = { ...this.options, ...options };
    }
}
