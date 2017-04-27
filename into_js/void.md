void 操作符执行给定的表达式并且返回undefined.

####语法
> void expression

####用处

######获取undefined值
void表达式经常被用来获取undefined初始值
```
var c=void 0;
```
######立即执行函数表达式
void可以迫使function关键词被作为函数表达式，而不是函数声明；
```
void function a(){console.log('function expression')}();
```
###### javaScript URIs
当浏览器碰到一个javascript:URI时，它会执行URI中的code，然后使用code的返回值替换页面中的内容，除非返回值是undefined。
void表达式能够被用来返回undefined
```
<a href="javascript:void(0);">
   Click here to do nothing
</a>

<a href="javascript:void(document.body.style.backgroundColor='green');">
    Click here for green backgrond
</a>
```