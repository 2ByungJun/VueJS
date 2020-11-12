import 'normalize.css';
import styles from './index.css';

function component() {
    const element = document.createElement('div');
    element.innerHTML = 'Hello Webpack';

    element.classList = styles.helloWebpack;

    return element;
}

document.body.appendChild(component());