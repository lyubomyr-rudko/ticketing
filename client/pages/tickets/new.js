import { useState } from "react";
import { useRequest } from "../../hooks/useRequest";
import Router from "next/router";

const NewTicket = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const handlePriceBlur = (e) => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  const { doRequest, errors } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push("/"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    doRequest();
  };

  return (
    <div>
      <h1>Create a Ticket</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Title</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Price</label>
          <input
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={handlePriceBlur}
          />
        </div>
        {errors}
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button className="btn btn-primary">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default NewTicket;
