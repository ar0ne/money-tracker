import { css } from 'lit';

export const styles = css`
  .disabled {
    color: grey;
    cursor: not-allowed;
    pointer-events: none;
    background-color: #ffffff;
  }

  .hide {
    display: none;
  }

  main {
    margin-left: 25px;
  }

  app-currency {
    display: block;
    border: 1px;
    border-style: solid;
    border-color: black;
  }

  app-category {
    display: block;
    border: 1px;
    border-style: solid;
    border-color: black;
  }
`;