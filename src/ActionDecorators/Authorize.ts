import { Constructable, IContext, IRole, LoggerCollection } from "@furystack/core";
import { IncomingMessage, ServerResponse } from "http";
import { IRequestAction } from "../Models/IRequestAction";

export const Authorize = (...roles: IRole[]) =>
    <T extends Constructable<IRequestAction>>(constructor: T) => {
    return class extends constructor {
        public readonly authorize: IRole[] = roles;
        public async exec(incomingMessage: IncomingMessage, serverResponse: ServerResponse, getContext: () => IContext): Promise<void> {
            const authorized = await getContext().isAuthorized(...roles);
            if (!authorized) {
                serverResponse.writeHead(403, "Forbidden");
                serverResponse.end();
                const currentUser = await getContext().getCurrentUser();
                getContext().getInjector().GetInstance(LoggerCollection).Warning({
                    scope: "@furystack/http-api/@Authorize()",
                    message: `User '${currentUser.Username}' has been tried to access to action '${incomingMessage.url}' without the required roles.`,
                    data: {
                        user: currentUser,
                        roles,
                    },
                });
                return;
            }
            return await super.exec(incomingMessage, serverResponse, getContext);
        }
    };
};
