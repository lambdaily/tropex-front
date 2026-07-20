import { useNavigation, AppRouter } from "@/app/routes";

export function TroperoApp() {
  const nav = useNavigation();
  return <AppRouter nav={nav} />;
}
