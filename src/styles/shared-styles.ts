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
  .removed {
    text-decoration: line-through;
  }
  .hide {
    display: none;
  }
  .color-0 {
    background-color: #D0E1D4;
    padding: 0.1em;
  }
  .color-1 {
    background-color: #33658A;
    padding: 0.1em;
  }
  .color-2 {
    background-color: #FFE2FE;
    padding: 0.1em;
  }
  .color-3 {
    background-color: #71697A;
    padding: 0.1em;
  }
  .color-4 {
    background-color: #5B8298;
    padding: 0.1em;
  }
  .color-5 {
    background-color: #2F4858;
    padding: 0.1em;
  }
  .color-6 {
    background-color: #937B43;
    padding: 0.1em;
  }
  .color-7 {
    background-color: #003459;
    padding: 0.1em;
  }
  .color-8 {
    background-color: #F26419;
    padding: 0.1em;
  }
  .color-9 {
    background-color: #9CEAEF;
    padding: 0.1em;
  }
  .color-10 {
    background-color: #8C271E;
    padding: 0.1em;
  }

  @media (prefers-color-scheme: light) {
    .color-1, .color-3, .color-4, .color-5, .color-6, .color-7, .color-8, .color-10 {
        color: white;
    }
  }

`;
