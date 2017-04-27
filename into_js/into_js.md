###值和类型
js内建的类型有下面7种:
- string
- number
- boolean
- null 和 undefined
- object
- symbol(ES6引入)

js提供了`typeof`操作符来获取一个值的类型
```
var a;
typeof a;    //"undefined"

a="hello world";
typeof a;     //"string"

a=null;
typeof a;      //"object" --怪异
```

typeof操作符的返回值总是7个内建类型
`typeof "abc"` 返回的是"string"，而不是string（返回的是一个字符串）
`typeof null` 是一个有趣的情况，因为它返回object,而不是你期望的null
注意`a=undefined`和`var a;`是一样的，另外可以通过多种方式获取undefined值，包括没有返回值的function和void操作符

#####objects
objects是一个包含键值对的混合值类型，它可能是javascript中最有用的值类型之一；
```
var obj={
    a:"hello word",
    b:42;
    c:true
}

obj.a;   //"hello world"
obj["a"];  //"hello world"
```
属性能够通过点符号或者括号符号访问。
如果你访问的属性key有特殊符号，比如`obj["hello world!"]`,括号符号是有用的；
当然如果你要访问某个属性，但属性名存储在另一个变量中，这个时候括号符号也是很有用的；

##### Arrays
有一对另外的值类型array和function你将在javascript经常会用到，相对于内建类型，他们应该称为
亚类型，object类型的特殊化版本。
```
var arr=["hello world",42,true];
arr[0];     //"hello world"
arr.length   //3
typeof arr;   // "object"
```

因为arrays是一个特殊的object,所以它也能有属性，包括自动更新的`length`属性；
你能使用array作为普通的object来添加命名属性，也可以把object类似array来给它数字的属性；

##### Functions
object的另一个亚类型，你将会在整个js编程中使用，是function
```
function foo(){
    return 42;
}
foo.bar="hello world";

typeof foo;   //"function"
typeof foo();    //"number"
typeof foo.bar;   //"string"
```
因为function是object的亚类型，所以也能有属性；


##### 内建类型的方法
我们以上讨论的内建类型和亚类型通过属性和方法对外提供行为。
例子如下：
```
 var a="hello world";
 var b=3.14259;
 
 a.length;
 a.toUpperCase();
 b.toFixed(4);
```
为什么可以访问属性和方法呢？
因为对于所有的内建类型，JS都提供了相应的对象包装类型；一个string 值被String对象包装，
一个number值被Number对象包装，你不需要担心或者直接使用这些包装类型，选择使用原始值，
javascript会帮组你做剩余的工作。

##### 比较值
###### 类型转换
有显式类型转换，和隐式类型转换

###### 真值和假值
当一个非boolean类型值，转成boolean值；
Javascript假值列表如下：
- ""(空字符串)
- 0，-0，NaN(非数字)
- null, undefined
- false

不在以上假值列表中的任何值都是真值，例子入下：
- "hello"
- 42
- true
- [],[1,'2',3] （数组）
- { },{a:42} (对象)
- function foo(){...} （方法）

###### 相等
相等有两种操作符`==`和`===`；

他们之间的不同：`==`检测值相等，允许值做类型转换；`===`检测值相等，不允许值做类型转换；

`==`做类型转换的细节：?

注意相等比较两个非基础类型值时，比如objects（包括function和array）。`==`和`===`会简单的比较引用是否相等；

###### 不相等
`<`,`>`,`<=`和`>=`不相等操作符，通常用于比较number值，但javascript `string`值也能使用不相等操作符，通过字母规则`"bar"<"foo"`

与`==`操作符相似，不相等操作符也允许类型转换；如果两个值都是字符串，则按照字母规则来比较大小，但如果只要有一个是非字符串，则两个
值都转换成`number`，按照数字大小来比较；

##### 变量
变量名以a-z，A-Z,$或者_来开头，能包含他们和0-9等数字作为后续字符；不可使用保留字

###### 函数作用域
变量提升；
作用域链；

##### 严格模式
"use strict" 放在方法内，则方法内代码激活严格模式；如果放在file中，则整个file激活严格模式；

##### 函数作为变量
###### 立即执行函数
```
(function IIFE(){
    console.log("Hello!");
})();
```

###### 闭包
闭包是一个很重要的并且缺少认知的javascript概念。你可以认为闭包是一个记住或者继续访问函数的作用域，即便函数已经允许结束了；

模块
在javascript中对闭包用的最多的地方就是模块了。模块让你定义私有变量和方法，对于外部隐藏他们，同时暴露必要的api给外部；
比如：
```
function User(){
    var username,password;
    function doLogin(user,pw){
        username=user;
        password=pw;
    }
    
    var publicAPI={
        login:doLogin
    };
    
    return publicAPI;
    }
    
    var fred=User();
    fred.login("fred","12Battery34!");
```


##### `this` Identifier
认识到`this`不指向方法自己，是很重要的；
下面是一个快速的说明：
```
function foo(){
    console.log(this.bar);
}
var bar="global";
var obj1={
    bar:"obj1",
    foo:foo
}
var obj2={
    bar:"obj2"
}
//-----------
foo();
obj1.foo();
foo.call(obj2);
new foo();
```
有4种规则设置`this`的指向，他们已经展现在以上那段代码中的4行
1. foo() 在非严格模式下，`this`指向全局对象，在严格模式下，`this`指向`undefined`并且你会得到一个错误，在访问`bar`属性时；
2. obj1.foo() 设置`this`指向obj1对象
3. foo.call(obj2) 设置`this`指向obj2对象
4. new foo() 设置`this`指向一个新生成的对象

##### Prototypes
Javascript的原型机制非常复杂，这里只是瞥一眼；
当你访问对象的一个属性时，如果属性不存在，javascript会自动使用对象的原型链去找属性；
内部的原型引用发生在对象被创建时，最简单的方法是`Object.create(..)`
比如：
```
var foo={
    a:42
}
var bar=Object.create(foo);
bar.b="hello world";
bar.b;
bar.a;
```

##### Old & New
我们应该去使用更新的语法；为了兼容老浏览器，一般我们用两种做法，以使我们使用的新语法兼容这些老古董；
###### Polyfilling
使用腻子脚本，是老版本浏览器也支持新语法；但并不是所有的新语法都可以使用腻子脚本打补丁来实现；
###### Transpiling
把新语法书写的代码翻译成低版本JS,比如babel；