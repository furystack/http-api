import { SystemRoles } from "@furystack/core";
import { visitorUser } from "@furystack/core/dist/Models";
import { Injector } from "@furystack/inject";
import { expect } from "chai";
import { IdentityService } from "../src/IdentityService";
import { RequestContext } from "../src/RequestContext";
export const requestContextTests = describe("RequestContext", () => {

    const r = new RequestContext({ headers: {} } as any, null as any, new IdentityService(), Injector.Default);

    it("should be constructed", () => {
        expect(r).to.be.instanceof(RequestContext);
    });

    it("getInjector() should return the provided injector", () => {
        expect(r.getInjector()).to.be.eq(Injector.Default);
    });

    it("currentUser should return Visitor by default", async () => {
        const user = await r.getCurrentUser();
        expect(user).to.be.eq(visitorUser);
    });

    it("IsAuthorized should return true for visitor by default", async () => {
        const authorized = await r.isAuthorized(SystemRoles.Visitors);
        expect(authorized).to.be.eq(true);
    });

    it("IsAuthorized should return false for not-applied claims", async () => {
        const authorized = await r.isAuthorized({ Name: "Not-Authorized-Role", DisplayName: "" });
        expect(authorized).to.be.eq(false);
    });

    it("IsAuthenticated should return false by default", async () => {
        const authenticated = await r.isAuthenticated();
        expect(authenticated).to.be.eq(false);
    });

});
