import { css } from '@emotion/css';

const Banner = () => {
  return (
    <div>
      <div className={css`
          display: flex;
        `}
      >
        <img
          className={css`
              width: 130px; 
              margin-right: 20px;
            `}
          src="/connectDao.webp"
          alt=""
        />
        <div className={css`
              display: flex; 
              flex-direction: column;
            `}
        >
          <h1 className={css`
              font-size: 32px; 
              font-weight: 300;
              margin: 10px 0;
            `}
          >
            歡迎來到島島阿學！一起找找資源、共編資源吧
          </h1>
          <p className={css`
                font-size: 20px; 
                font-weight: 300;
                line-height: 30px;
              `}
          >
            If you want to go fast go alone.
            <br />
            If you want to go far go together.
            <br />
          </p>
        </div>
      </div>
    </div>
  );
};

export default Banner;
