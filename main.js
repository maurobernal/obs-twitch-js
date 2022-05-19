const { time } = require("console");
const OBSWebSocket = require("obs-websocket-js");
const obs = new OBSWebSocket();

const tmi = require("tmi.js");

//#region "OBS-Funciones"
async function ConnectOBS() {
  await obs
    .connect({
      address: "localhost:4444",
      password: "M1st2rPassw0rd!",
    })
    .catch((err) => console.log(err))
    .then(console.log("OBS conectado"));

  //Handler
  // You must add this handler to avoid uncaught exceptions.
  obs.on("error", (err) => {
    console.error("socket error:", err);
  });
}

const GetVersion = async () => await obs.send("GetVersion");
const GetCurrentScene = async () => (await obs.send("GetCurrentScene")).name;
const GetScenes = async () => (await obs.send("GetSceneList")).scenes;
const SetScene = async (sceneName) => {
  try {
    await obs.send("SetCurrentScene", { "scene-name": sceneName });
  } catch (error) {
    console.log(error);
  }
};

const SaveScreen = async (scene) => {
  try {
    const res = await obs.send("TakeSourceScreenshot", {
      sourceName: scene,
      embedPictureFormat: "png",
      saveToFilePath: "C:/temp/obs/foto.png",
    });
    console.log(res);
  } catch (error) {
    console.log(error);
  }
};
//#endregion "OBS-Funciones"

//#region "TMI"

//#region "Stream"
const CapturarPantalla = async () => {
  const scene = await GetCurrentScene();
  await SaveScreen("CapturaOrig");
  await SetScene("Captura");
  await new Promise((resolve) => setTimeout(resolve, 2500));

  console.log("vuelve a :" + scene);
  await SetScene(scene);
};

//#endregion #Stream
async function ConnectTMI() {
  const client = new tmi.Client({
    channels: ["maurobernal"],
  });
  client.connect().catch(console.error).then(console.log("TMI Conectado"));

  client.on("message", (channel, tags, message, self) => {
    if (self) return;
    if (message.toLowerCase() === "!foto") {
      console.log(tags.username + ":" + message);
      CapturarPantalla();
    }
  });
}
//#endregion "TMI"

async function main() {
  console.log("Punto de entrada");
  await ConnectTMI();
  await ConnectOBS();
  console.log(await GetCurrentScene());
}

main();

//#region

//     .then(() => {
//         console.log(`Success! We're connected & authenticated.`);

//         return obs.send('GetSceneList');
//     })
//     .then(data => {
//         console.log(`${data.scenes.length} Available Scenes!`);

//         data.scenes.forEach(scene => {
//             if (scene.name !== data.currentScene) {
//                 console.log(`Found a different scene! Switching to Scene: ${scene.name}`);

//                 obs.send('SetCurrentScene', {
//                     'scene-name': scene.name
//                 });
//             }
//         });
//     })
//     .catch(err => { // Promise convention dicates you have a catch on every chain.
//         console.log(err);
//     });

// obs.on('SwitchScenes', data => {
//     console.log(`New Active Scene: ${data.sceneName}`);
// });
