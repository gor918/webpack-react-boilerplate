import React from 'react';
import ReactDOM from 'react-dom';
import './styles.scss';
import LogoIcon from 'assets/logo.svg';

const App = () => (
    <div className="logo">
        <img src={LogoIcon} alt="" />
    </div>
);

export default (): void => {
    ReactDOM.render(<App />, document.getElementById('root'));
};
