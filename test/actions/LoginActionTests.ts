import { Injector } from "@furystack/inject";
import { expect } from "chai";
import { IncomingMessage, ServerResponse } from "http";
import { IdentityService } from "../../src";
import { LoginAction } from "../../src/Actions/Login";
export const loginActionTests = describe("LoginAction", () => {
    /** */
    it("exec", () => {
        const testUser = {Name: "Userke"};
        const i = new Injector({parent: undefined});
        i.SetInstance({}, IdentityService);
        i.SetInstance({}, IncomingMessage);
        i.SetInstance({writeHead: () => (undefined), end: (result: string) => {
            expect(result).to.be.eq(JSON.stringify(testUser));
        }}, ServerResponse);
        const c = i.GetInstance(LoginAction, true);
        c.exec();
    });
});
