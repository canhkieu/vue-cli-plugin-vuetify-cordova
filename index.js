const { info } = require("@vue/cli-shared-utils");
const spawn = require("cross-spawn");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

const defaults = {
  mode: "development",
  host: "0.0.0.0",
  port: 8080,
  https: false,
  platform: "browser"
};

module.exports = (api, options) => {
  const address = require("address");
  const portfinder = require("portfinder");

  api.registerCommand(
    "cordova-serve",
    {
      description: "start development server for cordova",
      usage: "vue-cli-service cordova-serve [options]",
      options: {
        "--open": `open browser on server start`,
        "--host": `specify host (default: ${defaults.host})`,
        "--port": `specify port (default: ${defaults.port})`,
        "--https": `use https (default: ${defaults.https})`
      }
    },
    args => {
      const projectDevServerOptions = options.devServer || {};
      portfinder.basePort =
        args.port ||
        process.env.PORT ||
        projectDevServerOptions.port ||
        defaults.port;
      return portfinder.getPortPromise().then(port => {
        const serveArgs = {
          open: args.open,
          host:
            args.host ||
            process.env.HOST ||
            projectDevServerOptions.host ||
            defaults.host,
          port,
          https: args.https || projectDevServerOptions.https || defaults.https,
          lanIp: address.ip()
        };

        let indexUrl = `http://${serveArgs.lanIp}:${serveArgs.port}`;

        let target = path.resolve(__dirname, "../../platforms");
        let pathSync = path.resolve(__dirname, "../../public/cordova");
        console.log({ target, pathSync });
        if (!fs.existsSync(pathSync)) {
          console.log("Folder /public/cordova not sync with /platforms");
          console.log("Begin sync and link");
          fs.symlinkSync(target, pathSync, "dir");
        }
        // return;
        setConfig(indexUrl);
        // return;
        return api.service.run("serve", serveArgs).then(result => {
          let childProcess = null;
          switch (args._[0]) {
            case "android":
              childProcess = spawn("cordova", ["run", "android"]);
              break;
            case "ios":
              childProcess = spawn("cordova", ["run", "ios"]);
              break;
            default:
              info(
                "Build servce done. Open your browser and enter local address"
              );
              info("npm run cordova android | If you wan run app on android");
              info("npm run cordova ios | If you wan run app on ios");
              break;
          }

          if (childProcess) {
            childProcess.stdout.on("data", data => {
              console.log(`Cordova: ${data}`);
            });

            childProcess.stderr.on("data", data => {
              console.log(`Cordova: ${data}`);
            });

            childProcess.on("close", code => {
              console.log(`Cordova build done. Code ${code}`);
            });
          }
        });
      });
    }
  );

  api.registerCommand(
    "cordova-production",
    {
      description: "Cordova build production",
      usage: "vue-cli-service cordova-production [options]"
    },
    args => {
      const serveArgs = {
        dest: "www"
      };
      info("Preparing for build production...");

      // fs.symlinkSync('../platforms', './public/cordova', 'dir')

      // const wwwDirPath = api.resolve("www");
      // copyRedirectHtml(serveArgs, wwwDirPath);
      setConfig();
      return api.service.run("build", serveArgs).then(result => {
        info("Preparing for build " + args._[0] + " app");
        // process.env.OS = "android";
        // console.log(process.env);
        // return;
        let childProcess = null;
        switch (args._[0]) {
          case "android":
            childProcess = spawn("cordova", ["build", "android"], {
              env: process.env
            });
            break;
          case "ios":
            childProcess = spawn("cordova", ["build", "ios"]);
            break;
          default:
            childProcess = spawn("cordova", ["build", "browser"]);
            break;
        }

        if (childProcess) {
          childProcess.stdout.on("data", data => {
            console.log(`Cordova: ${data}`);
          });

          childProcess.stderr.on("data", data => {
            console.log(`Cordova: ${data}`);
          });

          childProcess.on("close", code => {
            console.log(`Cordova build done. Code ${code}`);
          });
        }
      });
    }
  );
  api.configureWebpack(config => {
    config.output.publicPath =
      process.env.NODE_ENV === "development" ? "/" : "./";
  });
};

function setConfig(url = "index.html") {
  var parser = new xml2js.Parser();
  var xmlBuilder = new xml2js.Builder();

  const configPath = path.resolve(__dirname, "../../config.xml");
  console.log(configPath);
  fs.readFile(configPath, function(err, data) {
    parser.parseString(data, function(err, result) {
      result.widget.content = {
        $: { src: url }
      };

      var xml = xmlBuilder.buildObject(result);

      fs.writeFile(configPath, xml, function(err, data) {
        if (err) console.log(err);
        console.log("successfully written our update xml to file");
      });
    });
  });

  // const templateStr = fs.readFileSync(templatePath, "utf-8");
  // const htmlStr = ejs.render(templateStr, args);
  // if (!fs.existsSync(distDirPath)) {
  //   fs.mkdirSync(distDirPath);
  // }
  // const distPath = path.resolve(distDirPath, "index.html");
  // fs.writeFileSync(distPath, htmlStr);
}

module.exports.defaultModes = {
  "cordova-serve": "development",
  "cordova-production": "production"
};
