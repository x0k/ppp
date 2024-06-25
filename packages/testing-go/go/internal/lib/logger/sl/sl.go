package sl

import "log/slog"

func Err(err error) slog.Attr {
	if err == nil {
		return slog.Attr{
			Key:   "error",
			Value: slog.StringValue("nil"),
		}
	}
	return slog.Attr{
		Key:   "error",
		Value: slog.StringValue(err.Error()),
	}
}

func Component(component string) slog.Attr {
	return slog.Attr{
		Key:   "component",
		Value: slog.StringValue(component),
	}
}

func Op(op string) slog.Attr {
	return slog.Attr{
		Key:   "op",
		Value: slog.StringValue(op),
	}
}
