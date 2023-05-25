import { memo } from "react";
import { Button, View, Text, TextInput } from "react-native";
import { useForm, Controller } from "react-hook-form";

type FormInputs = {
  email: string;
  password: string;
};

interface SignInFormProps {
  isSignUp?: boolean;
  onSubmit?: (values: FormInputs) => void;
}

export const EmailPasswordForm = memo(
  ({ onSubmit, isSignUp = false }: SignInFormProps) => {
    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm<FormInputs>({
      defaultValues: {
        email: "",
        password: "",
      },
    });

    return (
      <View>
        <View>
          <Text>Email</Text>
          <Controller
            control={control}
            rules={{
              maxLength: 100,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Email address"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="email"
          />
        </View>
        <View>
          <Text>Password</Text>
          <Controller
            control={control}
            rules={{
              maxLength: 100,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
              />
            )}
            name="password"
          />
        </View>
        <View>
          <Button title="Sign In" onPress={handleSubmit(onSubmit)} />
        </View>
      </View>
    );
  }
);
