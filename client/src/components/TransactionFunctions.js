import axios from "axios";

export const transaction = (txn) => {
  return axios
    .post("txn/transaction", {
      username: txn.username,
      account: txn.account,
      // password: txn.password,
      reciever_name: txn.reciever_name,
      recieveraccount_number: txn.recieveraccount_number,
      amount: txn.amount,
    })
    .then((response) => {
      console.log("New transaction");
    });
};
