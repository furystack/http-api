import { Injector } from "@furystack/inject";
import { expect } from "chai";
import { IncomingMessage, ServerResponse } from "http";
import { IdentityService } from "../../src";
import { LogoutAction } from "../../src/Actions/Logout";

export const logoutActionTests = describe("LogoutAction", () => {
    it("exec", () => {
        const testUser = {Name: "Userke"};
        const i = new Injector({parent: undefined});
        i.SetInstance({}, IdentityService);
        i.SetInstance({}, IncomingMessage);
        i.SetInstance({writeHead: () => (undefined), end: (result: string) => {
            expect(result).to.be.eq(JSON.stringify(testUser));
        }}, ServerResponse);
        const c = i.GetInstance(LogoutAction, true);
        c.exec();
    });
});
