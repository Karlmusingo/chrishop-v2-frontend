import { FC } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";

interface FormErrorAlertProps {
  errors: string[];
  onDismiss: () => void;
}

const FormErrorAlert: FC<FormErrorAlertProps> = ({ errors, onDismiss }) => {
  if (errors.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>Erreur</span>
        <button type="button" onClick={onDismiss} className="ml-2">
          <X className="h-4 w-4" />
        </button>
      </AlertTitle>
      <AlertDescription>
        {errors.length === 1 ? (
          <p>{errors[0]}</p>
        ) : (
          <ul className="list-disc pl-4">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default FormErrorAlert;
