import React from "react";
import "./Success.scss";
import { CheckCircleTwoTone } from '@ant-design/icons';

const Success = (props) => {
  return (
    <div className="body_success">
      <div className="card">
        <CheckCircleTwoTone size={400}/>
        <h1>Create Booking Success</h1>
        <p>
          การจองของคุณได้ถูกสร้างขึ้นสำเร็จแล้ว;
          <br /> หมายเลขการจอง XXX!
        </p>
      </div>
    </div>
  );
};

export default Success;
