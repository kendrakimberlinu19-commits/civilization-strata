# 本地手部识别资源

- MediaPipe Tasks Vision 0.10.21，Google AI Edge，Apache-2.0；授权文本见 LICENSE.txt。
- 程序和 WASM 来自官方 npm 包 @mediapipe/tasks-vision，经 jsDelivr 下载：https://www.npmjs.com/package/@mediapipe/tasks-vision/v/0.10.21
- 模型：Google MediaPipe Hand Landmarker float16 / version 1，https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
- 官方接入说明：https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js

以上资源随网站部署，点击开启摄像头后才加载，不依赖访客访问第三方 CDN。摄像头仅请求 video，不请求音频；画面在本机浏览器内推理，不录制、不上传。页面隐藏、关闭模式或点击停止时释放摄像头。首次启用须用户授予本站摄像头权限；HTTPS 或 localhost 才可使用。

手势几何阈值、停留时间及冷却在 gesture-logic.js 中集中维护；gesture-control.js 管理权限、预览、模型和资源释放。
