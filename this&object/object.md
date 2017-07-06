Object.getPrototypeOf();
Object.assign({},myObject...);
Object.defineProperty(myObject,'a',{value:2,writable:true,configurable:true,enumerable:true});
Object.getOwnPropertyDescriptor(myObject,'a');

Object.preventExtensions();
Object.seal();
Object.freeze();

迭代
for...in
for...of
Object.keys();  //不查询原型链
Object.prototype.getOwnPropertyNames()
枚举
Object.prototype.propertyIsEnumberable()

存在
in
Object.prototype.hasOwnProperty()

## 对象属性
在对象中，属性名 总是 字符串。如果你使用 string 以外的（基本）类型值，它会首先被转换为字符串
```
var myObject = { };

myObject[true] = "foo";
myObject[3] = "bar";
myObject[myObject] = "baz";

myObject["true"];				// "foo"
myObject["3"];					// "bar"
myObject["[object Object]"];	// "baz"
```

## Configurable

(1) 只要属性当前是可配置的，我们就可以使用相同的 defineProperty(..) 工具，修改它的描述符定义。
(2) configurable:false 阻止的另外一个事情是使用 delete 操作符移除既存属性的能力。

## 不可变性
(1)对象常量
   通过将 writable:false 与 configurable:false 组合，你可以实质上创建了一个作为对象属性的 常量（不能被改变，重定义或删除）
(2)防止扩展
   如果你想防止一个对象被添加新的属性，但另一方面保留其他既存的对象属性，可以调用 Object.preventExtensions(..)
(3)封印
   Object.seal(..) 创建一个“封印”的对象，这意味着它实质上在当前的对象上调用 Object.preventExtensions(..)，同时也将它所有的既存属性标记为 configurable:false。
   所以，你既不能添加更多的属性，也不能重新配置或删除既存属性（虽然你依然 可以 修改它们的值）
(4)冻结
   Object.freeze(..) 创建一个冻结的对象，这意味着它实质上在当前的对象上调用 Object.seal(..)，同时也将它所有的“数据访问”属性设置为 writable:false，所以它们的值不可改变。
   这种方法是你可以从对象自身获得的最高级别的不可变性，因为它阻止任何对对象或对象直属属性的改变（虽然，就像上面提到的，任何被引用的对象的内容不受影响）。
   你可以“深度冻结”一个对象：在这个对象上调用 Object.freeze(..)，然后递归地迭代所有它引用的（目前还没有受过影响的）对象，然后也在它们上面调用 Object.freeze(..)。但是要小心，这可能会影响其他你并不打算影响的（共享的）对象。

## [[put]]和[[get]]

## Getters和Setters
```
var myObject = {
	// 为 `a` 定义 getter
	get a() {
		return this._a_;
	},

	// 为 `a` 定义 setter
	set a(val) {
		this._a_ = val * 2;
	}
};

myObject.a = 2;

myObject.a; // 4
```

## 存在性
in  会检查原型链
in 操作符看起来像是要检查一个值在容器中的存在性，但是它实际上检查的是属性名的存在性。在使用数组时注意这个区别十分重要，因为我们会有很强的冲动来进行 4 in [2, 4, 6] 这样的检查，但是这总是不像我们想象的那样工作。

hasOwnProperty  不会检查原型链

## 枚举
```
var myObject = { };

Object.defineProperty(
	myObject,
	"a",
	// 使 `a` 可枚举，如一般情况
	{ enumerable: true, value: 2 }
);

Object.defineProperty(
	myObject,
	"b",
	// 使 `b` 不可枚举
	{ enumerable: false, value: 3 }
);

myObject.b; // 3
("b" in myObject); // true
myObject.hasOwnProperty( "b" ); // true

// .......

for (var k in myObject) {
	console.log( k, myObject[k] );
}
// "a" 2
```

notice: 将 for..in 循环实施在数组上可能会给出意外的结果，因为枚举一个数组将不仅包含所有的数字下标，还包含所有的可枚举属性。所以一个好主意是：将 for..in 循环 仅 用于对象，而为存储在数组中的值使用传统的 for 循环并用数字索引迭代。

（当下）没有与 in 操作符的查询方式（在整个 [[Prototype]] 链上遍历所有的属性，如我们在第五章解释的）等价的、内建的方法可以得到一个 所有属性 的列表。你可以近似地模拟一个这样的工具：递归地遍历一个对象的 [[Prototype]] 链，在每一层都从 Object.keys(..) 中取得一个列表——仅包含可枚举属性。


## 迭代
####迭代键
for..in 循环迭代一个对象上（包括它的 [[Prototype]] 链）所有的可迭代属性
数组使用for,不建议用for..in

#### 迭代值
数组：forEach(),some(),every();

ES6: for...of
```
var myObject = {
	a: 2,
	b: 3
};

Object.defineProperty( myObject, Symbol.iterator, {
	enumerable: false,
	writable: false,
	configurable: true,
	value: function() {
		var o = this;
		var idx = 0;
		var ks = Object.keys( o );
		return {
			next: function() {
				return {
					value: o[ks[idx++]],
					done: (idx > ks.length)
				};
			}
		};
	}
} );

// 手动迭代 `myObject`
var it = myObject[Symbol.iterator]();
it.next(); // { value:2, done:false }
it.next(); // { value:3, done:false }
it.next(); // { value:undefined, done:true }

// 用 `for..of` 迭代 `myObject`
for (var v of myObject) {
	console.log( v );
}
// 2
// 3
```
