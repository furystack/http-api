import { IncomingMessage, ServerResponse } from "http";
import { IdentityService } from "../IdentityService";
import { IRequestAction } from "../Models";
import { Utils } from "../Utils";

export class LoginAction implements IRequestAction {
    public dispose() { /**  */}

    public async exec() {
        const loginData = await Utils.readPostBody<{ username: string, password: string }>(this.incomingMessage);
        const user = await this.identityService.cookieLogin(loginData.username, loginData.password, this.serverResponse);
        this.serverResponse.writeHead(200, {
            "Content-Type": "application/json",
        });
        this.serverResponse.write(JSON.stringify(user));
        this.serverResponse.end();
    }
    constructor(private readonly identityService: IdentityService, private incomingMessage: IncomingMessage, private serverResponse: ServerResponse) {
    }
}
