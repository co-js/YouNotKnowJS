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

