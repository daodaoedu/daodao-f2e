type Category =
  | "語言"
  | "個人發展"
  | "生活品味"
  | "藝術與設計"
  | "醫藥與運動"
  | "商管與理財"
  | "資訊與電腦科學"
  | "大眾傳播"
  | "社會與心理學"
  | "教育與學習"
  | "數理邏輯"
  | "人文史地"
  | "社會創新與永續"
  | "工程"
  | "法政與軍事"
  | "自然與環境"
  | "其他";

type CategoryListTypes = {
  title: Category;
  label: string;
  translationKey: string;
  img: string;
};

//! 圖片大小問題, 可能會需要用到 local
export const CategoryList: CategoryListTypes[] = [
  {
    title: "語言",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/dc91/2cd2/4beb38ca747c64f37ea8ad1339e180aa?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qn~ymbrLOjSPeNIzl82w~3sX4khPYsUMR3m7q-QpVLLF9sxpQS50zYZMm1gJGs6ENm-o-NeHQI6cBmXblUzPUq3xYrwtFx0okLGaaxoZwp4LnsSVBRmpwSb5EwGaT8f~bHBJAhVX7JBjTWYGv~WS-c4VBhDK~mLfdUip9A381k1RfhPBALll~VdbIGf2XJKF4afvJVvXa8sF~8RMtSwy5wOZo5kJMaAnf4Yi6KANtzXwbXGndtt8IymidXyYaBbJGAakhJ4jWQwx64VszWOP9lrwIz4c6pbqsL2D-g5bpyC-Cbjj-lYzlKsuZtwg7z0WtZ0f1UVQNjh7FltLX4BIJw__",
  },
  {
    title: "個人發展",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/9ddf/d8b7/6e50f42b19e1c76c2e4aea973945cad1?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=p8w1UZnL~76-Qe4liByjYl3tMfrtxLtEvuvWNJswUQi19BsS4AA6uaSYLpQMY1xy-8egvXSEo95YcUwjFITokaoF0x6v9oXc7rPbyoAMc8e3wteFqXQ2P0a6vs8Sf95sHh6VW96ErnjnR0HwEdAXEK6ITQkkGzxM3UoyIRhBZBMnNpu~kUAyEZqtiJnnRjJSPY~aeYydR1hmMr5hWCMWVaQ4rWyEpBdsCsAmj3X75Tf4eub2ROaoinEJxFJBKtM0JWakTwueADL~QskUiLydbDhPQppv~yzEIlH6glhHy7RJYVdu3ul3J6zhNSj8gOGjf4O0iFEVc21jNYmc3PSDVA__",
  },
  {
    title: "生活品味",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/aa80/9102/4d00c05e470e98151c7f0b35bf9a93a3?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=aVdoW2W0PiYx1ew278T1c34XyQKu4J4U2RTLEh7q337hvvpmlMrSIywC0R-PB5VUSPtN1L1~RyNNa2JyDoKmDZQ~KGxsEkuJ0J3NepT38QEzoOBg~Cl0NC9NCpfeaXLyKLooAL-ohletASmXy~O0XGv0HzM4VcGlIktbIMZ38A-geL8cH~-2a7LJFct7B8a~xCIG~tnr0GFR6a-GcxJb4icCfT588L7YPhA7TWcVFDETZ0QGi4m9LI7uHNE8A~QchWdur7zCaRQ036yOTs8cOJWWZpqR45XnLykJaznIy5BQahr3vnRPUYQ3ilFVp35AAeDBhOVOhPdY2D~euyKTDg__",
  },
  {
    title: "藝術與設計",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/d989/846d/8123dae7d024df1159eeb59ca31b8a9b?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=iYgN426H6xrpVDtHpuXFqxdHKC9kU9tw7BD2uSyOnhj-mnOkZQe5n9B8Ahu9VmqVGZh1LCZ9zDPe95yTnYWndTKq8mF0WJnXrRXudjZwCTIBqD959u3Q3UKFjE~HhS1R0wg040qaWvZWcrXM08i954ZLksew9bheeY3zFWDP2XrZe2RiaV1Ca~R9rApxTyrjCJ8M6jc9Na5a-A~yN0Y27hqZ3-b3XyIBZUDy2mFZTFpDLEkYuT69gEKvyjQdPbA3e0KchHtQ6VkwcsGuWD1vV~vWWw3Z5yQmKJnFB-qdSrEB~8d960fsQ3Q7-lK95ASwD~CnqSqqRLGTRQSn~uTTCw__",
  },
  {
    title: "醫藥與運動",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/b46b/c6b7/66626a8a694d7829646d2c116037b492?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=HUqdIKlHZ9nPFXRCZTCCARW~VWC0MBxVAitr8MHnYm1XgntnG098WjFuDg1VygVvaAh7V5anmCKPaBhvZLZ5oVn0j2gLt9q5d313iWkereD2fNiYrtx3YzChawYLxWwTnSMOtS6fU8WsbsdeGilsANhDQTqiUiOjh4W0~5Nbn6DrvurzeQEpOKz6dyDTWpJ69rDL0C-nBAW1S0W~pxQBMcjNHnAmGIdQlbInHMrgGlNPUD5ImTmCK9mkJKrc0fgtA9dmyHnNzT5n8j15SOvOGiP3Ck6xwgYLWfIc3MvJZ3fk1vsmCPLbT9Od47PmWEVWkPqAOLev1H9uKzvPmDow0Q__",
  },
  {
    title: "商管與理財",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/2370/4f3a/417b942a88d9b8b53339ebe2c00c6dfe?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=o7jUXbs1mfaNEhxEJvq1myngWkfmSz~LDoeyGaDZpavzIjSWX20Du2o-yZmiU7xR7Mh4vcUmPeR85~irGUa46FcscYY1nXyVvYD7wXQfrokf1P~m5ZJ7Gl42RAnuwIXC4-eOt-r4xNGa2klnaxR2z1-1muXDC1Q2ozg4FERIZ3C84NqQbkneWSO-Ij4MH3-i2GoGFE~WdmesGAFHPm7fr8KX46eeBilx2H6XwaOniHvBZipixTIQ9MT09in5mqTbLJ9z6SnSzQZNpY5WR1eIae2HdCYnNpABy5vBnINlbKoGTa0IGZvhtViZOAiKGAvxgdGVjbTzR8jnT83NGTq3Uw__",
  },
  {
    title: "資訊與電腦科學",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/e3ee/c7b8/2d3382f7ccf2138623af862dc68d4ed9?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=GtMOjteIX6350PfLPK9AzwSzpwttOdUfcCdi9sltrao47BpVcxYN63Wm5J9YjQT7A~scrzSa-zER2oolQkwl0oqGfmHOon-ZVjHO8JdK6vcxiwpQS9~Vt4VVEw4VqSbueqbbu3ykU62tq12Qajoq1KUmSmS3iwmM~ah1QtBCUApSVgvTHHYBxowFM3rlmIiNQU2Htj0R8AdJRuRQSNb09iAw6nnsaYQSV2WJZ4tYDuJVjjSMljW0TaD3RJXH5I2GWAqx47-iMs~sQ-TnNRDwJKjxFBDXwI4R-VbDA7QVUm8FtUENY39C8nnuxul2eOh0kL0vEp6upPThjjnYjjG8NA__",
  },
  {
    title: "大眾傳播",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/3e1a/b812/fccbf3f49a6b554a9e58d071f4f1e9e4?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=cX9VCt0JmsW4Nt7~yXOjhU6eBDrlymNSy3PWJ5f28LtdV-SeTDBy6LqFPRiF-Y3TqsMymT7w-Xwe41MCujemrU139Mrsw-W6oEHv1t0x66OcWL~19CeZr-Lv4FwoP6GWse5lLiqSPIib25HdBY20HnLQm0EPQT0Cc6voqIhji5aUs~NmM3rzbYufsPH6IRcefTmd6crelmVzj-hc6m3bGSbS8LT~H1DjXqoeZ0KEZduMWUpdX3mlPsXOMux4gPC5fjtAYAm9AST9-wzf-eOx13PV0TAmmpIY1g57syyl4r2KllsnBw-kjGnLd9~-wCFwYS7GOz15rZmBU5r--SFH6A__",
  },
  {
    title: "社會與心理學",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/749a/fe52/218f7d100e0f105a5f706f01501b0a22?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=BjXbVbgSh2U6mhRt4XyPUQj25OyQcriJDoAgHo0yx5P3sSwAV3PMkiRZPQkfWhR7SHwaf~MzBs1IVTCGDDE2f~nCbhE~WN0I25AUUPuhpuq7ffIlInUu3hmDtkCEzF3pWTTJU~gKDFbSJPb1TcjLvz4QZUWozupKrFwicvBoaWks4DxlyO7zYYuZ0jZRVyJ5fswX7dJ~Ec6YuR4Lv~QtkeNNX-c2zA~Idh6A75Q~KVwqU1-CgdFRPoI8rJV9fPZ7T7uF7qBH7TLGPkhMAbiTOGjZdGJYLp3OXdZSj1RuyYyu1gomMT3xPHsQTBKWt~g9wWXy~YikEF12lsaLXCELRg__",
  },
  {
    title: "教育與學習",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/7a97/984b/0b3f329786302288bc6bc705f0b287d3?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=EIZX3VFPnK~T4Gt-ovfXpSMSqMBxDdgO8VHGn3K8frWWuspkXodXTUq9MtGkrfO-wbnCSjKAyFKVznd~a2n2w7EUqRE83CqKP9tr99ET567ZAl0xS0qR-Py~GYSFZ7gXFHpjI1tBCFkBsRSEUXVv0v-cNyab~bzFWAge121N~bWf6iY-JseXFjgpuiAMbPITb8I~Voiq~ZAM4PBkcM7D4TyQy~inRaZ7R~N1jOG0cGE8DCEp-T4BAktKHwTjyoY7yAlrc~EVkE2OAQhySW~QKIS1abc3g17KJueBgq3MQw5yZ96iZjqyanyNWUmT1SnVL5V~CeryYVXjZPEjL-g7Zg__",
  },
  {
    title: "數理邏輯",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/a016/6e41/d3a6f400edd47e7b5da3853a10fd95f9?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=rQXKgnxrLZgDK6o5eloF5N49RtNlNlhqd19kKUMmgxhhoIklu-Z0rtTwjeENWdioM-p7ksTftcQzZes68A1qo4xgELqfTTtnbZIWRfUUaRlz0gz~hDgleLr8xH7g-637AiJC6T3jM5QwTKrAd~UxmbV-MXZ2i5J4w0w1X4q6miS4i4MytOKFxNOWb3wj63Tl7M3wSPi-DlxwAuHyuVmfN~tGRV5RtyfV4hdhATSq-vfaLDfMMQhlP-Z9n0Mj3JJruqkQwtk~y6RTY8aExDSmdpvK5YRIRm~kIAocLIOPwrDLRf6NrJYVMTWAT3uD4M6YGdSrOW2hUdSK5cyqFt9jbw__",
  },
  {
    title: "人文史地",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/ade8/be00/4ce1d26f47426195d6233fed7fff7423?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=Jmr4MsvX~Uf4Y0xdMWDSghXxly~qolTzoegOl0wviIJExAo4erowm1lLEWkc-trCw3iiMP8IR85g9irsLQb6KQftqH4yac5G6xhZPfHUZlBI6RbDVAavpSe8P7q6bPs53kmcxr4xUG99CGcNNmYIYHt4XKESEIzNZ9E~m0YBw1MQ5oJNyQR4r7INg8kWAYvQUc~CwIAFRjl4G~zlvmhXENcJuvCVcC313HlPPegKpTcOfIq90Wr76FVJwL8hVTHLCkSATjxWEmD4wpsumPi86lcI45FE0PuEj5XZaeZDmpPH5~D78OXpic-PN0bvFDVbKp785QFwvIzRaQC3QMY2sQ__",
  },
  {
    title: "社會創新與永續",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/c873/608e/e159bcd33e4f0f76a97593d95496cc34?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=rTM6k5B1kvLXrSWiix1EGvKbygy49jzWHQqqtde6KGsX0s60KLwLXKRzUn7-68Ars9-JP0xlyeK5RC~yZTfloSGOXZemT93PKLYSK2e1eL-B3-VNB3hyZ8WY7~g9XsfLpsl9jAw-ss8q1QR-U5LWnPdkBHMT7pxTmeJkgF0t~dRt3PPBmM0ICmcUGSJ9p1oLqOkhsNOG~cnWvWO89vXPxSVFMZgNXhUE6O1XOWIALNX7dJC7kIfRB-7lhRY66aB7B6LW9uxFJsGUjIqreJRsC46WiIe3zQ-36rUdbRIZB1DqDjKnAgClMpc~vyTZBvJmYQeOvOxwN835wsT4LKcGQw__",
  },
  {
    title: "工程",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/6f99/e983/5e8e3e9e1ad60e838c82dac3a104784a?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=jrA8h3WotuqpyH7QSAyp0YVBNg~uyysaFVGnvd4CBVRM9-OXQJ7ya5lcBD79YHUgmuQPAhYCG5jWIR7N7VnU5CywRW3s5YOeHamzxxgBfksOB8X9dWUvrc90jKcqPUsBtt7fw3hg230UuwCLRxWRKJpz1k6PEf~PCMVuNPdG5nFhl1XHs361TMykYbfY6LPJs25YeZBLXlncIVawLHcToIk06MHWX6acBRsZ6bzeysrTfzjoT6qREiyuoVyp4p8gipVeM2Y0oEcAwTJtChowB8PT3ZwvjLK0eCjrObZlMLi1FqdBvIHjQX15ZBLUxwXaD6-E~JL2MSwosAlJdTNXNg__",
  },
  {
    title: "法政與軍事",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/638b/94a6/d2b96b3f94a1f177a87d31b3c3a6aa02?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=bWFhiCLYrzTpP7NJpKLNj7Gs4TLQ8fHcWcxwqBoo3jg022EgoyxjnWVhwRHGyhZdykXVKbEEVdoVACwI4~emZV0sS2jJ4FDgKieB~2R8NwtWZp2OfPTr9TqbnjsHFHXY4dTIpTr7oLfRQBHhGi8nI3nXtvI6lwyOS-AihAsagpXf1NzIO4LHHN9r2ziPfPQBaQgEq8R7FAI0nHiITohblSqp3QytzWPINlN7dB8SVQ0H5zJyhzFxvPXJxoi~~eU8i4323Wu9kvVQdLo2G-0JxJHZNVKdVxo4fPr8ubWn5fQX3-262AXbwpK3m1aFRHKFWPFprz7e66~iIPTRMl6RDw__",
  },
  {
    title: "自然與環境",
    translationKey: "",
    label: "",
    img: "https://s3-alpha-sig.figma.com/img/35d7/ab4d/4f6bdd98ff8e6b70ff3b14be00ba4de8?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=KQmxhCBTEiW6DV~ew6lZEEh7MfZMcS2c90Gl3Mcb452u-0TUUCxT0nEC-kES4HiyNUpW3zgqev61p~9wWq5xqbbJKPFoJAGHGAJBtEJMK0aIOJxWHHhbFfGTCGD9Hh9CdwxDxgwPknYAvG1k30g0R6NyXBDrvbgkDm233gtNwCzkoG2JGqg54vaz03M-pPRraWAW-OlzPxUV-CfoQ3ySX9g2tFZOt1RZHS2GDR3yjYK~vU-XQASAuvozkHCQyKgwuslUIt-fZGtMBj20mXv7BCKpH5g1zwGfirRAUFVJNgH1k2Jkmt9zwtfi0pqYicV167iylMILpmNwvdTIOV84Ig__",
  },
  {
    title: "其他",
    translationKey: "",
    label: "",
    img: "",
  },
];
