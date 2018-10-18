import { IContext, IUser } from "@furystack/core";
import { IncomingMessage, ServerResponse } from "http";
import { ILoginUser } from "../IdentityService";
import { RequestAction } from "../RequestAction";

export class GetCurrentUser extends RequestAction {
    public async exec(_incomingMessage: IncomingMessage, serverResponse: ServerResponse, getContext: () => IContext): Promise<void> {
        const user = await getContext().getCurrentUser() as ILoginUser<IUser>;
        delete user.Password;
        serverResponse.writeHead(200, {
            "Content-Type": "application/json",
        });
        serverResponse.end(JSON.stringify(user));
    }
    public segmentName: string = "getCurrentUser";
}
