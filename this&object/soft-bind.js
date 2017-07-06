/**
 * Created by unnKoel on 2017/7/6.
 */
if (!Function.prototype.softBind) {
  Function.prototype.softBind = function (obj) {
    var fn = this,
      curried = [].slice.call(arguments, 1),
      bound = function bound() {
        return fn.apply(
          (!this ||
            (typeof window !== 'undefined' && this === window) ||
            (typeof global !== 'undefined' && this === global)
          ) ? obj : this,
          curried.concat.apply(curried, arguments)
        );
      };
    bound.prototype = Object.create(fn.prototype);
    return bound;
  }
}