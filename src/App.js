import React, { useState, useEffect } from "react";
import "./App.css";
import Modal from "react-modal";

function App() {
  const [writer, setWriter] = useState(null);
  const [deviceInfor, setInfor] = useState("");
  const [isModalShow, setModalShow] = useState(false);
  const chunks = [];
  const encoder = new TextEncoder();
  const decoder = new TextDecoder("utf-8");

  useEffect(() => {
    if (isModalShow) {
      getInfo();
    }
  });

  const connect = () => {
    const requestOptions = {
      filters: [{ vendorId: 0x2341 }]
    };
    navigator.serial.requestPort(requestOptions).then(port => {
      port.open({ baudrate: 115200 }).then(() => {
        const writer = port.writable.getWriter();
        setWriter(writer);
        let str = encoder.encode("~wk81\r\n");

        console.log(port);

        writer.write(str);

        getChunks(port.readable.getReader());
      });
    });
  };

  const getChunks = reader => {
    return reader.read().then(({ value, done }) => {
      if (done) {
        return chunks;
      }
      let str = decoder.decode(value).toString();
      handleChunk(str);
      return getChunks(reader);
    });
  };

  const handleChunk = value => {
    switch (value) {
      case "~Af0000\r\n":
        console.log("start data");
        break;
      case "~As0000\r\n":
        console.log("end data");
        break;
      case "~Wk0000\r\n":
        console.log("can start scan");
        break;
      default:
        console.log(isModalShow);
        if (isModalShow) {
          // Mong muốn khi show modal, get được info thì phải nhảy vào đây
          // Nhưng cái isModalShow kia nó lại ko thay đổi
          setInfor(value);
        } else {
          chunks.push(value);
          console.log(chunks);
        }
        break;
    }
  };

  const openModal = () => {
    if (writer) {
      setModalShow(true);
      console.log("Get Info");
    }
  };

  const getInfo = () => {
    let str = encoder.encode("~rv\r\n");
    writer.write(str);
  };

  const closeModal = () => {
    setModalShow(false);
  };

  return (
    <div className="App">
      <div className="App-header">
        <button onClick={connect}>Connect</button>
        <br></br>
        <button onClick={openModal}>getInfor</button>
        <Modal
          ariaHideApp={false}
          isOpen={isModalShow}
          onRequestClose={closeModal}
        >
          <div>{deviceInfor}</div>
        </Modal>
      </div>
    </div>
  );
}

export default App;
