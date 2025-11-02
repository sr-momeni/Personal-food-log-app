import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import {
  CameraIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowPathIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { downscaleImageFile } from "@/utils/image";

const captureLabel = "Capture Photo";
const uploadLabel = "Upload Photo";

export function MealCaptureDialog({ open, onClose, onConfirm }) {
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState("");
  const [draftFile, setDraftFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const resetState = useCallback(() => {
    setPreviewUrl("");
    setDraftFile(null);
    setError("");
    setIsProcessing(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleFileSelected = useCallback(async (file) => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const { file: optimizedFile, previewUrl: optimizedPreview } =
        await downscaleImageFile(file);
      setDraftFile(optimizedFile);
      setPreviewUrl(optimizedPreview);
      setError("");
    } catch (err) {
      setError(
        err?.message ||
          "We couldn't process this photo. Please try another or reduce its size."
      );
      setDraftFile(null);
      setPreviewUrl("");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const triggerCameraPicker = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
      cameraInputRef.current.click();
    }
  };

  const triggerUploadPicker = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
      uploadInputRef.current.click();
    }
  };

  const handleInputChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      handleFileSelected(file);
    },
    [handleFileSelected]
  );

  const handleConfirm = useCallback(async () => {
    if (!draftFile || !previewUrl) return;
    await onConfirm({ file: draftFile, previewUrl });
    handleClose();
  }, [draftFile, handleClose, onConfirm, previewUrl]);

  const handleRetake = useCallback(() => {
    resetState();
    triggerCameraPicker();
  }, [resetState]);

  const handleChooseAnother = useCallback(() => {
    resetState();
    triggerUploadPicker();
  }, [resetState]);

  const handleRemove = useCallback(() => {
    resetState();
  }, [resetState]);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const canConfirm = useMemo(
    () => Boolean(draftFile && previewUrl) && !isProcessing,
    [draftFile, previewUrl, isProcessing]
  );

  return (
    <Dialog
      open={open}
      size="xs"
      handler={handleClose}
      dismiss={{ enabled: true }}
      className="mx-4 mb-4 rounded-3xl bg-white p-0 shadow-xl sm:mx-auto sm:w-[420px]"
      containerProps={{
        className:
          "fixed inset-0 z-[999] grid items-end justify-center bg-black/40 px-4 pb-6 sm:items-center",
      }}
    >
      <DialogHeader className="flex items-center justify-between px-5 py-4">
        <div>
          <Typography variant="h5" className="text-[var(--food-primary-dark)]">Add Meal Photo</Typography>
          <Typography variant="small" className="text-slate-500">
            Capture a new shot or pick from your gallery
          </Typography>
        </div>
        <IconButton
          variant="text"
          color="blue-gray"
          onClick={handleClose}
          className="rounded-full"
        >
          <XMarkIcon className="h-5 w-5" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="space-y-4 px-5 pb-5">
        <div className="rounded-2xl border border-orange-100/60 bg-orange-50/60 p-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Meal preview"
              className="h-48 w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl bg-white text-orange-300">
              <CameraIcon className="mb-3 h-12 w-12" />
              <Typography variant="small" className="text-orange-300">
                Your photo preview will appear here
              </Typography>
            </div>
          )}
        </div>

        {error && (
          <Typography
            variant="small"
            color="red"
            className="font-medium leading-relaxed"
          >
            {error}
          </Typography>
        )}
        {isProcessing && !error && (
          <Typography variant="small" className="text-slate-500">
            Optimising photo for upload...
          </Typography>
        )}

        <div className="flex flex-wrap gap-3">
          {!previewUrl ? (
            <>
              <Button
                color="orange"
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2"
                onClick={triggerCameraPicker}
                disabled={isProcessing}
              >
                <CameraIcon className="h-5 w-5" />
                {captureLabel}
              </Button>
              <Button
                variant="outlined"
                color="orange"
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2"
                onClick={triggerUploadPicker}
                disabled={isProcessing}
              >
                <PhotoIcon className="h-5 w-5" />
                {uploadLabel}
              </Button>
            </>
          ) : (
            <>
              <Button
                color="orange"
                variant="outlined"
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2"
                onClick={handleRetake}
                disabled={isProcessing}
              >
                <ArrowPathIcon className="h-5 w-5" />
                Retake
              </Button>
              <Button
                variant="outlined"
                color="orange"
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2"
                onClick={handleChooseAnother}
                disabled={isProcessing}
              >
                <PhotoIcon className="h-5 w-5" />
                Choose Another
              </Button>
              <Button
                variant="text"
                color="red"
                className="flex-1 min-w-[100px] flex items-center justify-center gap-2"
                onClick={handleRemove}
                disabled={isProcessing}
              >
                <TrashIcon className="h-5 w-5" />
                Remove
              </Button>
            </>
          )}
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleInputChange}
        />
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
      </DialogBody>

      <DialogFooter className="flex items-center justify-between gap-3 px-5 pb-5 pt-0">
        <Button
          variant="outlined"
          color="orange"
          onClick={handleClose}
          className="border-orange-200 text-[var(--food-primary-dark)] hover:bg-orange-50"
        >
          Cancel
        </Button>
        <Button
          color="orange"
          className="flex items-center justify-center gap-2 shadow-sm shadow-orange-200/60"
          onClick={handleConfirm}
          disabled={!canConfirm}
        >
          <CheckIcon className="h-5 w-5" />
          Confirm Photo
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

MealCaptureDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default MealCaptureDialog;
