import ffmpeg from "fluent-ffmpeg";
import Koa from "koa";
import Router from "koa-router";
import HttpError from "./error";

// 通过ffmpeg拉流并转码
function command(url: string): ffmpeg.FfmpegCommand {
    const ffmpegCommand = ffmpeg(url);

    return ffmpegCommand
        .withNoAudio()
        .withSize("?x480")
        .withVideoCodec("libx264")
        .toFormat("flv")
        .on("error", (err: Error) => {
            console.log(err.message);
            ffmpegCommand?.kill("SIGKILL");
        });
}

const router = new Router().get("/videoapi", ctx => {
    ctx.set("Access-Control-Allow-Origin", "*");

    if (!ctx.query.url) {
        return new HttpError(400, "取流地址不能为空");
    }

    ctx.body = command(ctx.query.url).pipe();
});

new Koa()
    .use(HttpError.middleware)
    .use(router.routes())
    .listen(3000);
