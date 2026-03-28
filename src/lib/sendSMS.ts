class SendSMS {
  public static async Send(
    mobileNo: string,
    message: string,
    templateID: string
  ) {
    try {
      const sMessage = encodeURIComponent(message);
      void sMessage;

      const baseUrl =
        process.env.SMS_BASE_URL || "";
      const authKey =
        process.env.SMS_AUTH_KEY || "";
      const sender =
        process.env.SMS_SENDER || "";
      const route =
        process.env.SMS_ROUTE || "2";
      const country =
        process.env.SMS_COUNTRY || "91";

      if (!baseUrl || !authKey || !sender) {
        return "ERROR:SMS config missing";
      }

      const URI = baseUrl.endsWith("?")
        ? baseUrl
        : `${baseUrl}?`;

      let myParameters =
        "authkey=" +
        authKey +
        "&sender=" +
        sender +
        "&route=" +
        route +
        "&country=" +
        country +
        "&DLT_TE_ID=" +
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
