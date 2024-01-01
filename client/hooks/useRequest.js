import axios from "axios";
import { useState } from "react";

export const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState([]);

  const doRequest = async (props = {}) => {
    try {
      setErrors([]);

      const resp = await axios[method](url, { ...body, ...props });

      if (onSuccess) {
        onSuccess(resp.data);
      }

      return resp.data;
    } catch (err) {
      if (err?.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors([{ message: "Something went wrong on the client" }]);
        console.error(err);
      }
    }
  };

  return {
    doRequest,
    errors: errors.length > 0 && (
      <div className="alert alert-danger">
        <h4>Signup Error</h4>
        <ul className="my-0">
          {errors.map((err) => (
            <li key={err.message}>{err.message}</li>
          ))}
        </ul>
      </div>
    ),
  };
};
