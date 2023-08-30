# code-push-nestjs

## 模版重置

- 修改 package.json name/version/description/author
- 修改 LICENSE 作者
- 修改 个人风格 prettierrc 文件

## 探索

### nodemon 和 hmr 的区别

```
nodemon是重启项目，而HMR是替换改变的内容，这两者有本质区别

webpack HMR 是运行时对模块进行热替换，保证了应用状态不会丢失

这个项目用的是 ts-node-dev 一样是重启，不明白为什么他不用 nestjs 官方推荐的
module.hot
```

### release-it

```
可以在 github 发布release版本的命令
```

## 梳理该项目的环境搭建

### Question 1

`.husky/pre-commit: line 4: 98986 Segmentation fault: 11  yarn lint-staged
husky - pre-commit hook exited with code 139 (error)`

husky 对于yarn命令的执行需要声明对应的 PATH
所以需要在全局添加 ~/.huskyrc 文件

```sh
# This loads nvm.sh and sets the correct PATH before running the hook
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Question 2

`error TS2550: Property 'replaceAll' does not exist on type 'string'.`

```
tsconfig.json 添加  "lib": ["ESNext"]
```
