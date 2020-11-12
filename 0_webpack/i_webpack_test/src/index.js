const readLine = require('readline'); // readline 내장 모듈
const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

import mathUtil from './mathUtil';
import log from './log';

rl.question(
    "넓이를 구하고자 하는 도형의 종류를 입력해주세요 ( 정사각형, 원 ) : ",
    figure => {
        console.log(`선택된 도형 : ${figure}`);

        switch(figure){
            case '정사각형':
                rl.question("변의 길이를 입력해주세요 : ", input => {
                    console.log(`${log.logInput(input)}`);
                    console.log(`${log.logResult(figure, mathUtil.getSquareArea(input))}`);
                    rl.close();
                });
                break;
            case '원':
                rl.question("반지름의 길이를 입력해주세요 : ", input => {
                    console.log(`${log.logInput(input)}`);
                    console.log(`${log.logResult(figure, mathUtil.getSquareArea(input))}`);
                    rl.close();
                });
                break;
            default:
                console.log(log.logError);
                rl.close();
                break;
        }
    }
);