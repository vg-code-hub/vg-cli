tag=example/qa/jiaog/1.0.2

echo "1、vg build"

npx vg build $tag

echo "2、vg deploy"

npx vg deploy $tag  -p 'ak=$your_ak&as=$your_as'

echo "3、vg deploy"

npx vg publish $tag  -p 'ak=your_ak&as=$your_as&qyapi_key=$your_qyapi_key'
