import { IContext, IRole, IUser, visitorUser } from "@furystack/core";
import { Injector } from "@furystack/inject";
import { IncomingMessage, ServerResponse } from "http";
import { IdentityService } from "./IdentityService";

export class RequestContext implements IContext {
    public getInjector = () => this.injector;

    public Entities: any;
    public async isAuthenticated(): Promise<boolean> {
        const currentUser = await this.getCurrentUser();
        return currentUser !== visitorUser;
    }
    public async isAuthorized(...roles: IRole[]): Promise<boolean> {
        const currentUser = await this.getCurrentUser();
        for (const role of roles) {
            if (!currentUser.Roles.some((c) => c.Id === role.Id)) {
                return false;
            }
        }
        return true;
    }

    private _currentUser?: IUser;
    public async getCurrentUser(): Promise<IUser> {
        if (this._currentUser) {
            return this._currentUser;
        }
        const currentUser = await this.identityService.authenticateRequest(this.incomingMessage);
        this._currentUser = currentUser;
        return currentUser;
    }

    constructor(
        public readonly incomingMessage: IncomingMessage,
        public readonly serverResponse: ServerResponse,
        public readonly identityService: IdentityService<IUser>,
        private readonly injector: Injector,
    ) { }
}
