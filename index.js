var fs = require("fs");
var spawn = require("child_process").spawn;
var tmp = require("tmp");
var path = require("path");
var templatesDir = path.join(__dirname, "templates");
var compile = require("node-elm-compiler").compile;
var emitterFilename = "emitter.js";


// TODO: externalize all this and make it configurable
var srcFile = "examples/src/HomepageStylesheet.elm";
var elmModuleName = "HomepageStylesheet";
var destCssFile = path.join(__dirname, "output.css")
process.chdir("examples")
// END TODO


tmp.dir({unsafeCleanup: true}, function (err, tmpDirPath, cleanup) {
  if (err) {
    throw err;
  }

  var emitterDest = path.join(tmpDirPath, emitterFilename);

  compileEmitter({
    output: emitterDest
  }, function() {
    // Make the compiled emitter.js Node-friendly.
    fs.appendFileSync(emitterDest, "\nmodule.exports = Elm;");

    var Elm = require(emitterDest);
    var compiledCss = Elm.worker(Elm[elmModuleName]).ports.css + "\n";

    fs.writeFileSync(destCssFile, compiledCss);
  }, function(exitCode) {
    console.error("Errored with exit code", exitCode);

    process.exit(exitCode);
  });
});

function compileEmitter(options, onSuccess, onError) {
  compile(path.join(__dirname, srcFile), options)
    .on("close", function(exitCode) {
      if (exitCode === 0) {
        onSuccess()
      } else {
        onError(exitCode);
      }
    });
}
