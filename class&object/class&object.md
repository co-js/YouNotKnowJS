## 类理论
我们在软件中通过定义 Vehicle 类和 Car 类来模型化这种关系。
Vehicle 的定义可能会包含像动力（引擎等），载人能力等等，这些都是行为。我们在 Vehicle 中定义的都是所有（或大多数）不同类型的载具（飞机、火车、机动车）都共同拥有的东西。
在我们的软件中为每一种不同类型的载具一次又一次地重定义“载人能力”这个基本性质可能没有道理。反而，我们在 Vehicle 中把这个能力定义一次，之后当我们定义 Car 时，我们简单地指出它从基本的 Vehicle 定义中“继承”（或“扩展”）。于是 Car 的定义就被称为特化了更一般的 Vehicle 定义。
Vehicle 和 Car 用方法的形式集约地定义了行为，另一方面一个实例中的数据就像一个唯一的车牌号一样属于一辆具体的车。
这样，类，继承，和实例化就诞生了。
另一个关于类的关键概念是“多态（polymorphism）”，它描述这样的想法：一个来自于父类的泛化行为可以被子类覆盖，从而使它更加具体。实际上，相对多态允许我们在覆盖行为中引用基础行为。
类理论强烈建议父类和子类对相同的行为共享同样的方法名，以便于子类（差异化地）覆盖父类。我们即将看到，在你的 JavaScript 代码中这么做会导致种种困难和脆弱的代码。

#### 类设计模式
你可能从没把类当做一种“设计模式”考虑过，因为最常见的是关于流行的“面向对象设计模式”的讨论，比如“迭代器（Iterator）”、“观察者（Observer）”、“工厂（Factory）”、“单例（Singleton）”等等。当以这种方式表现时，几乎可以假定 OO 的类是我们实现所有（高级）设计模式的底层机制，好像对所有代码来说 OO 是一个给定的基础。

#### javascript的类
javascript没有类，只是语法糖，来努力满足用类进行设计的极其广泛的 渴望。

## 类机制
这个对象是所有在类中被描述的特性的 拷贝。

#### 构造器

#### 类继承
不要让多态把你搞糊涂，使你认为子类是链接到父类上的。子类得到一份它需要从父类继承的东西的拷贝。类继承意味着拷贝。

#### 多重继承
多重继承意味着每个父类的定义都被拷贝到子类中。
还有另外一个所谓的“钻石问题”：子类“D”继承自两个父类（“B”和“C”），它们两个又继承自共通的父类“A”。如果“A”提供了方法drive()，而“B”和“C”都覆盖（多态地）了这个方法，那么当“D”引用drive()时，它应当使用那个版本呢（B:drive()还是C:drive()）？

## 混合
在JavaScript中没有“类”可以拿来实例化，只有对象。而且对象也不会被拷贝到另一个对象中，而是被 链接在一起

#### 明确的Mixin
```
// 大幅简化的`mixin(..)`示例：
function mixin( sourceObj, targetObj ) {
	for (var key in sourceObj) {
		// 仅拷贝非既存内容
		if (!(key in targetObj)) {
			targetObj[key] = sourceObj[key];
		}
	}

	return targetObj;
}

var Vehicle = {
	engines: 1,

	ignition: function() {
		console.log( "Turning on my engine." );
	},

	drive: function() {
		this.ignition();
		console.log( "Steering and moving forward!" );
	}
};

var Car = mixin( Vehicle, {
	wheels: 4,

	drive: function() {
		Vehicle.drive.call( this );
		console.log( "Rolling on all " + this.wheels + " wheels!" );
	}
} );
```

但是由于JavaScript的特殊性，显式假想多态（因为遮蔽！） 在每一个你需要这种（假想）多态引用的函数中 建立了一种脆弱的手动/显式链接。这可能会显著地增加维护成本。而且，虽然显式假想多态可以模拟“多重继承”的行为，但这只会增加复杂性和代码脆弱性。

#### 寄生继承
```
// “传统的JS类” `Vehicle`
function Vehicle() {
	this.engines = 1;
}
Vehicle.prototype.ignition = function() {
	console.log( "Turning on my engine." );
};
Vehicle.prototype.drive = function() {
	this.ignition();
	console.log( "Steering and moving forward!" );
};

// “寄生类” `Car`
function Car() {
	// 首先, `car`是一个`Vehicle`
	var car = new Vehicle();

	// 现在, 我们修改`car`使它特化
	car.wheels = 4;

	// 保存一个`Vehicle::drive()`的引用
	var vehDrive = car.drive;

	// 覆盖 `Vehicle::drive()`
	car.drive = function() {
		vehDrive.call( this );
		console.log( "Rolling on all " + this.wheels + " wheels!" );
	};

	return car;
}

var myCar = new Car();

myCar.drive();
```

#### 隐含的 Mixin
```
var Something = {
	cool: function() {
		this.greeting = "Hello World";
		this.count = this.count ? this.count + 1 : 1;
	}
};

Something.cool();
Something.greeting; // "Hello World"
Something.count; // 1

var Another = {
	cool: function() {
		// 隐式地将`Something`混入`Another`
		Something.cool.call( this );
	}
};

Another.cool();
Another.greeting; // "Hello World"
Another.count; // 1 (不会和`Something`共享状态)
```

## 总结
JavaScript 不会自动地 （像类那样）在对象间创建拷贝。
mixin模式常用于在 某种程度上 模拟类的拷贝行为，但是这通常导致像显式假想多态那样(OtherObj.methodName.call(this, ...))难看而且脆弱的语法，这样的语法又常导致更难懂和更难维护的代码。
明确的mixin和类 拷贝 又不完全相同，因为对象（和函数！）仅仅是共享的引用被复制，不是对象/函数自身被复制。不注意这样的微小之处通常是各种陷阱的根源。
一般来讲，在JS中模拟类通常会比解决当前 真正 的问题埋下更多的坑。