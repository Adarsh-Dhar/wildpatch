"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ChunkyButton, ParchmentCard } from "./ui-kit";
import { Blight } from "./art/Blight";

type Props = { children: ReactNode };
type State = { hasError: boolean };
export class GameErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[wildpatch] tab render failed", error, info.componentStack);
  }
  render() {
    if (this.state.hasError)
      return (
        <ParchmentCard className="game-error">
          <Blight mood="sneaky" />
          <h2>Blight tangled the wires.</h2>
          <p>Let's get your field journal back on track.</p>
          <ChunkyButton onClick={() => this.setState({ hasError: false })}>
            Try again
          </ChunkyButton>
        </ParchmentCard>
      );
    return this.props.children;
  }
}
