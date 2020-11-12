const logInput = input => `입력받은 값 : ${input}`;
const logResult = (figure, result) => `${figure}의 넓이는 : ${result} 입니다.`;
const logError = "지원되지 않는 도형입니다. '정사각형' 또는 '원'을 입력해주세요. \n커맨드라인이 종료됩니다.";

export default{
    logInput,
    logResult,
    logError
}