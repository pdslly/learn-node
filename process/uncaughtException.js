/** Created by 31325_000 on 2018/1/4...*/
process.on('uncaughtException', function(err){
    console.log(err)
})

setTimeout(() => {
    console.log('still run')
}, 3000)

nonexistentFunc()

console.log('not run')