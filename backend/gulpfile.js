var gulp = require('gulp'),
less = require('gulp-less'),
livereload = require('gulp-livereload');



  
gulp.task('watch', function() { //这里的watch，是自定义的，携程live或者别的也行  
    livereload.listen();//这里需要注意！旧版使用var server = livereload();已经失效    
    gulp.watch('app/**', function(event) {  
        livereload.changed(event.path);  
    });  
});  