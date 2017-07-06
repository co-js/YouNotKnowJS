1.函数是通过new被调用的吗(new 绑定) ? 如果是，this就是新构建的对象。
var bar=new foo();

2. 函数是通过call 或apply 被调用(明确绑定)，甚至是隐藏在bind硬绑定之中吗？如果是，this就是那个被明确指定的对象。
var bar =foo.call(obj2);

3.函数是通过环境对象(也称为拥有者或容器对象)被调用的吗(隐含绑定)?如果是，this 就是那个环境对象。
var bar =obj1.foo();

4.否则，使用默认的this(默认绑定)。如果在strict mode下，就是undefined,否则是global对象。
var bar=foo();

### 被忽略的this
如果你传递 null 或 undefined 作为 call、apply 或 bind 的 this 绑定参数，那么这些值会被忽略掉，取而代之的是 默认绑定 规则将适用于这个调用。

如果目标函数不关心 this，你就需要一个占位值，而且正如这个代码段中展示的，null 看起来是一个合理的选择。

可是，在你不关心 this 绑定而一直使用 null 的时候，有些潜在的“危险”。如果你这样处理一些函数调用（比如，不归你管控的第三方包），而且那些函数确实使用了 this 引用，那么 默认绑定 规则意味着它可能会不经意间引用（或者改变，更糟糕！）global 对象（在浏览器中是 window）。

很显然，这样的陷阱会导致多种 非常难 诊断和追踪的 Bug。

### 更安全的this
使用一个空对象
```
function foo(a,b) {
	console.log( "a:" + a + ", b:" + b );
}

// 我们的 DMZ 空对象
var ø = Object.create( null );

// 将数组散开作为参数
foo.apply( ø, [2, 3] ); // a:2, b:3

// 用 `bind(..)` 进行 currying
var bar = foo.bind( ø, 2 );
bar( 3 ); // a:2, b:3
```

