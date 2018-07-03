export default function cordovaLoader(cb) {
  document.addEventListener("deviceready", () => {
    return cb();
  });
}
