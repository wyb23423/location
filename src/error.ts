import { ExtendableContext, Next } from "koa";

const ERROR_MSG = {
    //
};

export default class HttpError extends Error {
    public static async middleware(
        ctx: ExtendableContext,
        next: Next
    ): Promise<unknown> {
        let res: unknown = null;
        try {
            res = await next();
        } catch (err) {
            if (!(err instanceof Error)) {
                err = new HttpError(500);
            }

            console.log(err);

            ctx.status = typeof err.code === "number" ? err.code : 500;
            ctx.body = { code: ctx.status, message: err.message };
        }

        return res;
    }

    public constructor(
        public code: number,
        msg: string = ERROR_MSG[code as keyof typeof ERROR_MSG]
    ) {
        super(msg || "unknown error");
    }
}
