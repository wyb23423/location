import config from "./config.json";
import * as http from "http";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { URL } from "url";

// 通过ffmpeg拉流并转码
function command(url: string): ffmpeg.FfmpegCommand {
    const ffmpegCommand = ffmpeg(url);

    return ffmpegCommand
        .setFfmpegPath(path.resolve(config.FFmpegPath, "ffmpeg.exe"))
        .withNoAudio()
        .withSize("854x480")
        .withVideoCodec("libx264")
        .toFormat("flv")
        .on("error", (err: Error) => {
            console.log(err.message);
            ffmpegCommand.kill("SIGKILL");
        });
}

// 从请求地址中获取取流地址
function parse(req: http.IncomingMessage): string | null {
    const url = new URL("http://127.0.0.1" + req.url);
    if (url.pathname === config.pathname) {
        return url.searchParams.get("url");
    }

    return null;
}

http.createServer((req, res) => {
    const url = parse(req);
    if (!url) {
        res.statusCode = 404;
        res.end(`Not Found: ${req.method} ${req.url}`);
    } else {
        command(url).writeToStream(res, { end: true });
    }
}).listen(config.port);
