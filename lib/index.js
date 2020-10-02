// 实现这个项目的构建任务
const del = require('del')

const loadPlugins = require('gulp-load-plugins');
const plugins = loadPlugins();

const browserSync = require('browser-sync')
const bs = browserSync.create();

//parallel (parallel--平行的）并行任务
const {series, parallel, src, dest, watch} = require('gulp');

const data = {
    menus:[
        {
            name:'home',
            icon:'aperture',
            link:'index.html'
        },
        {
            name:'Feature',
            link:'feature.html'
        },
        {
            name:'About',
            link:'about.html'
        },
        {
            name:'Contact',
            link:'#',
            children:[
                {
                    name:"Twitter",
                    link:"https://twitter.com/w_zce"
                },
                {
                    name:'About',
                    link:'https://weibo.com/zceme'
                },
                {
                    name:"Twitter",
                    link:"https://twitter.com/w_zce"
                },
                {
                    name:'Baidu',
                    link:'https://baidu.com/'
                }
            ]
        }
    ],
    pkg:require('./package.json'),
    date:new Date()
}

const clean = () => {
    return del(['dist','temp']);
}

const style = () => {
    return src('src/assets/styles/*.scss',{base:'src'})
    .pipe(plugins.sass({outputStyle:'expanded'}))
    .pipe(dest('temp'))
}

const script = () => {
    return src('src/assets/scripts/*.js',{base:'src'})
    .pipe(plugins.babel({presets:['@babel/preset-env']}))
    .pipe(dest('temp'));
}

const page = () => {
    return src('src/*.html',{base:'src'})
    .pipe(plugins.swig({data}))
    .pipe(dest('temp'))
}

const image = () => {
    return src('src/assets/images/**',{base:'src'})
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const font = () => {
    return src('src/assets/fonts/**',{base:'src'})
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const extra = ()=>{
    return src('public/**', {base:'public'})
    .pipe(dest('dist'))
}

//读取流有不同的文件类型。

const serve = ()=>{
    watch([
        'src/assets/images/**',
        'src/assets/font/**',
        'public/**',
    ],bs.reload)

    watch('src/assets/styles/*.scss', style)
    watch('src/assets/scripts/*.js', script)
    watch('src/*.html', page)

    // watch('src/assets/images/**', image)
    // watch('src/assets/font/**', font)
    // watch('public/**', extra)

    bs.init({
        notify:false,
        port:2080,
        // open:false,
        files:'dist/**',
        server:{
            baseDir:['temp','src','public'],
            routes:{
                '/node_modules':'node_modules'
            }
        }
    })
}

const useref = () => {
    return src('temp/*.html',{base:'temp'})
          .pipe(plugins.useref({searchPath:['temp', '.']}))
          //html, js, css
          .pipe(plugins.if(/\.js$/, plugins.uglify()))
          .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
          .pipe(plugins.if(/\.html$/, plugins.htmlmin({collapseWhitespace:true, minifyCSS:true, minifyJS:true})))
          .pipe(dest('dist'))
}

const compile = parallel(style,script,page);

const build = series(
    clean, 
    parallel(
        series(compile,useref),
        image, 
        font,
        extra
    ));

const develop = series(compile, serve);

module.exports = {
    clean,
    build,
    develop,
}