class SendSMS {
  public static async Send(
    mobileNo: string,
    message: string,
    templateID: string
  ) {
    try {
      const sMessage = encodeURIComponent(message);
      void sMessage;

      const URI =
        "http://136.243.171.112/api/sendhttp.php?";
      let myParameters =
        "authkey=32366861726d6138333698&sender=HALTN&route=2&country=91&DLT_TE_ID=" +
        templateID +
        "&";

      myParameters +=
        "mobiles=91" +
        mobileNo +
        "&message=" +
        sMessage;

      myParameters = URI + myParameters;

      const response = await fetch(myParameters, {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.text();
      return result;
    } catch (error) {
      return `ERROR:${
        error instanceof Error
          ? error.message
          : "Unknown error"
      }`;
    }
  }
}

export default SendSMS;
