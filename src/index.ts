import config from "./config.json";
import ffmpeg from "fluent-ffmpeg";
import Koa from "koa";
import Router from "koa-router";
import path from "path";

// 通过ffmpeg拉流并转码
function command(url: string): ffmpeg.FfmpegCommand {
    const ffmpegCommand = ffmpeg(url);

    return ffmpegCommand
        .setFfmpegPath(path.resolve(config.FFmpegPath, "ffmpeg.exe"))
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
    ctx.body = command(ctx.query.url).pipe();
});

new Koa().use(router.routes()).listen(config.port);
