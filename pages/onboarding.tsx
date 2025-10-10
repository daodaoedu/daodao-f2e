import { useEffect, useState } from "react";
import { subYears } from "date-fns";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProtectedComponent } from "@/features/auth";
import { Form, parseSchemaAutoFocus } from "@/shared/ui/form";
import { Background, Container, Paper } from "@/shared/ui/wrapper";
import { Text, Title } from "@/shared/ui/typography";
import { RadioGroupWithForm } from "@/shared/ui/radio-group";
import { CheckboxWithForm } from "@/shared/ui/checkbox";
import { GENDER, ROLE } from "@/constants/member";
import { DatePickerWithForm } from "@/shared/ui/date-picker";
import { CATEGORIES } from "@/constants/category";
import { useCreateUser, useRegisterSuccessDialog } from "@/features/users";
import { createUserFormSchema, CreateUserFormSchema } from "@/services/users";
import { Image } from "@/shared/ui/image";
import { Button } from "@/shared/ui/button";
import SEOConfig from "@/components/SEOConfig";

function OnboardingBaseInfoFields() {
  const form = useFormContext<CreateUserFormSchema>();

  return (
    <>
      <Title
        as="h1"
        size="lg"
        className="text-center text-basic-500 mt-3 mb-10"
      >
        基本資料
      </Title>
      <div className="space-y-6">
        <DatePickerWithForm
          control={form.control}
          name="birthDay"
          fromDate={subYears(new Date(), 100)}
          toDate={subYears(new Date(), 16)}
        />
        <RadioGroupWithForm
          control={form.control}
          name="gender"
          options={GENDER}
          label="性別"
          required
          className="grid grid-cols-1 md:grid-cols-3 gap-2"
          renderOption={({ Option, isChecked, label }) => (
            <Option isChecked={isChecked}>{label}</Option>
          )}
        />
        <CheckboxWithForm
          control={form.control}
          name="roleList"
          options={ROLE}
          label="身份"
          required
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2"
          renderOption={({ Option, isChecked, label, image }) => (
            <Option
              isChecked={isChecked}
              className="flex flex-col items-center gap-2"
            >
              <Image src={image} alt={label} width={125} height={100} />
              {label}
            </Option>
          )}
        />
      </div>
    </>
  );
}

function OnboardingCategoryFields() {
  const form = useFormContext<CreateUserFormSchema>();

  return (
    <>
      <Title as="h1" size="lg" className="text-center text-basic-500 mt-3 mb-4">
        您對哪些領域感興趣？
      </Title>
      <Text size="lg" className="mb-6 text-basic-500 text-center">
        請選擇 2 ～ 6 個您想要關注的學習領域
      </Text>
      <div className="space-y-6">
        <CheckboxWithForm
          control={form.control}
          name="interestList"
          options={CATEGORIES}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
          renderOption={({ Option, isChecked, label, image = "" }) => (
            <Option
              isChecked={isChecked}
              className="flex flex-col items-center gap-2"
            >
              {label}
              <Image src={image} alt={label} width={125} height={81} />
            </Option>
          )}
        />
      </div>
    </>
  );
}

function OnboardingPage() {
  const [step, setStep] = useState(1);
  const openRegisterSuccessDialog = useRegisterSuccessDialog();
  const { trigger: createUser } = useCreateUser({
    onSuccess: openRegisterSuccessDialog,
  });

  const form = useForm({
    resolver: zodResolver(createUserFormSchema),
    mode: "onChange",
  });

  const handleNextStep = async () => {
    parseSchemaAutoFocus({
      form,
      schema: createUserFormSchema.omit({ interestList: true }),
      onSuccess: () => {
        setStep(step + 1);
      },
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  return (
    <ProtectedComponent onlyCheckToken>
      <SEOConfig title="註冊島島阿學" />
      <Background>
        <Container className="max-w-screen-lg pb-10">
          <Paper className="p-4 sm:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createUser(data))}>
                {step === 1 && <OnboardingBaseInfoFields />}
                {step === 2 && <OnboardingCategoryFields />}
                <div className="flex justify-center mt-10">
                  {step === 1 && (
                    <Button
                      key="next"
                      type="button"
                      size="lg"
                      className="w-40"
                      onClick={handleNextStep}
                    >
                      下一步
                    </Button>
                  )}
                  {step === 2 && (
                    <div className="flex gap-2 sm:gap-6">
                      <Button
                        key="previous"
                        type="button"
                        size="lg"
                        className="w-40"
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                      >
                        上一步
                      </Button>
                      <Button
                        key="submit"
                        type="submit"
                        size="lg"
                        className="w-40"
                      >
                        送出
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </Paper>
        </Container>
      </Background>
    </ProtectedComponent>
  );
}

export default OnboardingPage;
