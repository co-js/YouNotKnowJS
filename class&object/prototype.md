## [prototype]

#### 设置与遮蔽属性
```
myObject.foo = "bar";
```
(1) 如果myObject对象已直接经拥有了普通的名为foo的数据访问器属性，那么这个赋值就和改变既存属性的值一样简单
(2) 当foo 不直接存在 于myObject，但 存在 于myObject的[[Prototype]]链的更高层：
    如果一个普通的名为foo的数据访问属性在[[Prototype]]链的高层某处被找到，而且没有被标记为只读（writable:false），那么一个名为foo的新属性就直接添加到myObject上，形成一个 遮蔽属性。
    如果一个foo在[[Prototype]]链的高层某处被找到，但是它被标记为 只读（writable:false） ，那么设置既存属性和在myObject上创建遮蔽属性都是 不允许 的。如果代码运行在strict mode下，一个错误会被抛出。否则，这个设置属性值的操作会被无声地忽略。不论怎样，没有发生遮蔽。
    如果一个foo在[[Prototype]]链的高层某处被找到，而且它是一个setter（见第三章），那么这个setter总是被调用。没有foo会被添加到（也就是遮蔽在）myObject上，这个foosetter也不会被重定义。

如果你想在第二和第三种情况中遮蔽foo，那你就不能使用=赋值，而必须使用Object.defineProperty(..)（见第三章）将foo添加到myObject。

如果你需要在方法间进行委托，方法 的遮蔽会导致难看的 显式假想多态（见第四章）。一般来说，遮蔽与它带来的好处相比太过复杂和微妙了，所以你应当尽量避免它。第六章介绍另一种设计模式，它提倡干净而且不鼓励遮蔽。

遮蔽甚至会以微妙的方式隐含地发生，所以要想避免它必须小心。考虑这段代码:
```
var anotherObject = {
	a: 2
};

var myObject = Object.create( anotherObject );

anotherObject.a; // 2
myObject.a; // 2

anotherObject.hasOwnProperty( "a" ); // true
myObject.hasOwnProperty( "a" ); // false

myObject.a++; // 噢，隐式遮蔽！

anotherObject.a; // 2
myObject.a; // 3

myObject.hasOwnProperty( "a" ); // true
```
虽然看起来myObject.a++应当（通过委托）查询并 原地 递增anotherObject.a属性，但是++操作符相当于myObject.a = myObject.a + 1。结果就是在[[Prototype]]上进行a的[[Get]]查询，从anotherObject.a得到当前的值2，将这个值递增1，然后将值3用[[Put]]赋值到myObject上的新遮蔽属性a上。噢！

修改你的委托属性时要非常小心。如果你想递增anotherObject.a， 那么唯一正确的方法是anotherObject.a++。


## 类

#### 类函数
```
function Foo() {
	// ...
}

var a = new Foo();

Object.getPrototypeOf( a ) === Foo.prototype; // true
```
但是在JavaScript中，没有这样的拷贝处理发生。你不会创建类的多个实例。你可以创建多个对象，它们的[[Prototype]]连接至一个共通对象。但默认地，没有拷贝发生，如此这些对象彼此间最终不会完全分离和切断关系，而是 链接在一起。
结果我们得到两个对象，彼此链接。 如是而已。我们没有初始化一个对象。当然我们也没有做任何从一个“类”到一个实体对象拷贝。我们只是让两个对象互相链接在一起。

事实上，这个使大多数JS开发者无法理解的秘密，是因为new Foo()函数调用实际上几乎和建立链接的处理没有任何 直接 关系。它是某种偶然的副作用。new Foo()是一个间接的，迂回的方法来得到我们想要的：一个被链接到另一个对象的对象。

我们能用更直接的方法得到我们想要的吗？可以！ 这位英雄就是Object.create(..)。我们过会儿就谈到它。

#### 构造器
```
function Foo() {
	// ...
}

Foo.prototype.constructor === Foo; // true

var a = new Foo();
a.constructor === Foo; // true
```

#### (原型)继承
这里是一段典型的创建这样的链接的“原型风格”代码：
```
function Foo(name) {
	this.name = name;
}

Foo.prototype.myName = function() {
	return this.name;
};

function Bar(name,label) {
	Foo.call( this, name );
	this.label = label;
}

// 这里，我们创建一个新的`Bar.prototype`链接链到`Foo.prototype`
Bar.prototype = Object.create( Foo.prototype );

// 注意！现在`Bar.prototype.constructor`不存在了，
// 如果你有依赖这个属性的习惯的话，可以被手动“修复”。

Bar.prototype.myLabel = function() {
	return this.label;
};

var a = new Bar( "a", "obj a" );

a.myName(); // "a"
a.myLabel(); // "obj a"
```

这里一个常见的误解/困惑是，下面两种方法 也 能工作，但是他们不会如你期望的那样工作：
```
// 不会如你期望的那样工作!
Bar.prototype = Foo.prototype;

// 会如你期望的那样工作
// 但会带有你可能不想要的副作用 :(
Bar.prototype = new Foo();
```
Bar.prototype = Foo.prototype不会创建新对象让Bar.prototype链接。它只是让Bar.prototype成为Foo.prototype的另一个引用，将Bar直接链到Foo链着的 同一个对象：Foo.prototype。这意味着当你开始赋值时，比如Bar.prototype.myLabel = ...，你修改的 不是一个分离的对象 而是那个被分享的Foo.prototype对象本身，它将影响到所有链接到Foo.prototype的对象。这几乎可以确定不是你想要的。如果这正是你想要的，那么你根本就不需要Bar，你应当仅使用Foo来使你的代码更简单。

Bar.prototype = new Foo()确实 创建了一个新的对象，这个新对象也的确链接到了我们希望的Foo.prototype。但是，它是用Foo(..)“构造器调用”来这样做的。如果这个函数有任何副作用（比如logging，改变状态，注册其他对象，向this添加数据属性，等等），这些副作用就会在链接时发生（而且很可能是对错误的对象！），而不是像可能希望的那样，仅最终在Bar()的“后裔”被创建时发生。

让我们一对一地比较ES6之前和ES6标准的技术如何处理将Bar.prototype链接至Foo.prototype：
```
// ES6以前
// 扔掉默认既存的`Bar.prototype`
Bar.prototype = Object.create( Foo.prototype );

// ES6+
// 修改既存的`Bar.prototype`
Object.setPrototypeOf( Bar.prototype, Foo.prototype );
```

##### 考察‘类’关系
```
function Foo() {
	// ...
}

Foo.prototype.blah = ...;

var a = new Foo();
```
instanceof操作符的左边操作数接收一个普通对象，右边操作数接收一个 函数。instanceof回答的问题是：在a的整个[[Prototype]]链中，有没有出现被那个被Foo.prototype所随便指向的对象？

你只能查询某些对象（a）的“祖先”。如果你有两个任意的对象，比如a和b，而且你想调查是否 这些对象 通过[[Prototype]]链相互关联，单靠instanceof帮不上什么忙。
（1）
 ```
 // 用来检查`o1`是否关联到（委托至）`o2`的帮助函数
 function isRelatedTo(o1, o2) {
 	function F(){}
 	F.prototype = o2;
 	return o1 instanceof F;
 }

 var a = {};
 var b = Object.create( a );

 isRelatedTo( b, a ); // true
 ```

 第二种，也是更干净的方式，[[Prototype]]反射：
 ```
 Foo.prototype.isPrototypeOf( a ); // true
 ```
 我们 只需要 两个 对象 来考察它们之间的关系。比如：
 ```
 // 简单地：`b`在`c`的`[[Prototype]]`链中出现过吗？
 b.isPrototypeOf( c );
 ```
 我们也可以直接取得一个对象的[[Prototype]]。在ES5中，这么做的标准方法是:
 ```
 Object.getPrototypeOf( a ) === Foo.prototype; // true
 ```
 大多数浏览器（不是全部！）还一种长期支持的，非标准方法可以访问内部的[[Prototype]]：
 ```
 a.__proto__ === Foo.prototype; // true
 ```
 .__proto__实际上不存在于你考察的对象上（在我们的例子中是a）。事实上，它存在于（不可枚举地；见第二章）内建的Object.prototype上

 这个奇怪的.__proto__（直到ES6才标准化！）属性“魔法般地”取得一个对象内部的[[Prototype]]作为引用，如果你想要直接考察（甚至遍历：.__proto__.__proto__...）[[Prototype]]链，这个引用十分有用。

 .__proto__看起来像一个属性，但实际上将它看做是一个getter/setter（见第三章）更合适.我们可以这样描述.__proto__实现
 ```
 Object.defineProperty( Object.prototype, "__proto__", {
 	get: function() {
 		return Object.getPrototypeOf( this );
 	},
 	set: function(o) {
 		// setPrototypeOf(..) as of ES6
 		Object.setPrototypeOf( this, o );
 		return o;
 	}
 } );
 ```

## 对象链接

#### 创建连接
```
var foo = {
	something: function() {
		console.log( "Tell me something good..." );
	}
};

var bar = Object.create( foo );

bar.something(); // Tell me something good...
```

#### 填补Object.create()
```
if (!Object.create) {
	Object.create = function(o) {
		function F(){}
		F.prototype = o;
		return new F();
	};
}
```

Object.create(..)的这种用法是目前最常见的用法，因为他的这一部分是 可以 填补的。ES5标准的内建Object.create(..)还提供了一个附加的功能，它是 不能 被ES5之前的版本填补的
```
var anotherObject = {
	a: 2
};

var myObject = Object.create( anotherObject, {
	b: {
		enumerable: false,
		writable: true,
		configurable: false,
		value: 3
	},
	c: {
		enumerable: true,
		writable: false,
		configurable: false,
		value: 4
	}
} );

myObject.hasOwnProperty( "a" ); // false
myObject.hasOwnProperty( "b" ); // true
myObject.hasOwnProperty( "c" ); // true

myObject.a; // 2
myObject.b; // 3
myObject.c; // 4
```

