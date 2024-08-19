import { css } from 'lit';

export const styles = css`
  main {
    margin-left: 2%;
    margin-right: 2%;
  }
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .right {
    float: right;
  }
  .disabled {
    color: grey;
    cursor: not-allowed;
    pointer-events: none;
    background-color: #ffffff;
  }
  .hide {
    display: none;
  }
`;
