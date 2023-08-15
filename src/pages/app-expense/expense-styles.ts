import { css } from 'lit';

export const styles = css`
  @media(min-width: 1000px) {
    sl-card {
      max-width: 70vw;
    }
  }

  .selected {
    color: red;
  }

  .disabled {
    color: grey;
    cursor: not-allowed;
    pointer-events: none;
    background-color: #ffffff;
  }

  main {
    margin-left: 25px;
  }
`;