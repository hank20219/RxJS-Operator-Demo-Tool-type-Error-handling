import {
  catchError,
  combineLatest,
  delay,
  delayWhen,
  finalize,
  iif,
  interval,
  Observable,
  partition,
  retry,
  retryWhen,
  switchMap,
  tap,
  throwError,
  toArray,
  zip,
} from 'rxjs';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { HighlightResult } from 'ngx-highlightjs';
import { concat, take, takeUntil, map, merge, of, timer } from 'rxjs';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  response: HighlightResult;

  @Input() method: string = 'merge';

  code = ``;
  diagram = ``;
  specialDiagram = ``;
  isReady = false;

  ngOnInit() {
    this.isReady = true;
  }

  onHighlight(e) {
    this.response = {
      language: e.language,
      relevance: e.relevance,
      second_best: '{...}',
      top: '{...}',
      value: '{...}',
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    console.clear();
    this.code = `
        `;
    this.diagram = ``;
    this.specialDiagram = ``;
    this.isReady = false;
    switch (this.method) {
      case 'tap':
        this.setTapCode();
        this.tap();
        break;
      case 'toArray':
        this.setToArrayCode();
        this.toArray();
        break;
      case 'delay':
        this.setDelayCode();
        this.delay();
        break;
      case 'delayWhen':
        this.setDelayWhenCode();
        this.delayWhen();
        break;
      case 'catchError':
        this.setCatchErrorCode();
        this.catchError();
        break;
      case 'retry':
        this.setRetryCode();
        this.retry();
        break;
      case 'retryWhen':
        this.setRetryWhenCode();
        this.retryWhen();
        break;
      case 'finalize':
        this.setFinalizeCode();
        this.finalize();
        break;
      default:
        this.code = `
        `;
        this.diagram = ``;
        this.specialDiagram = ``;
    }
    setTimeout(() => {
      this.isReady = true;
    });
  }

  tap() {
    const observer = {
      next: (data) => console.log(`tap 示範 (2): ${data}`),
      error: (error) => console.log(`tap 示範 (2): 發生錯誤 - ${error}`),
      complete: () => console.log('tap 示範 (2): 結束'),
    };

    interval(1000)
      .pipe(
        take(3),
        map((data) => data * 2),
        map((data) => data + 1),
        tap(observer)
      )
      .subscribe();
    // tap 示範 (2): 1
    // tap 示範 (2): 3
    // tap 示範 (2): 5
    // tap 示範 (2): 結束
  }

  setTapCode() {
    this.code = `const observer = {
    next: (data) => console.log(\`tap 示範 (2): \${data}\`),
    error: (error) => console.log(\`tap 示範 (2): 發生錯誤-\${error}\`),
    complete: () => console.log('tap 示範 (2): 結束'),
  };

interval(1000).pipe(
  take(3),
  map(data => data * 2),
  map(data => data + 1),
  tap(observer)
).subscribe();`;
    this.diagram = `
source:
----1----3----5|

tap()`;
    this.specialDiagram = `----1----3----5|`;
  }

  toArray() {
    interval(1000)
      .pipe(take(3), toArray())
      .subscribe((data) => {
        console.log(`toArray 示範: ${data}`);
      });
    // toArray 示範: 0,1,2
  }

  setToArrayCode() {
    this.code = `interval(1000)
    .pipe(
      take(3),
      toArray()
    )
    .subscribe(data => {
      console.log(\`toArray 示範: \${data}\`);
    });
  // toArray 示範: 0,1,2`;
    this.diagram = `
---0---1---2|
toArray()
-----------[0, 1, 2]|`;
  }

  delay() {
    of(1, 2, 3)
      .pipe(delay(1000))
      .subscribe((data) => {
        console.log(`delay 示範: ${data}`);
      });
    // (等候 1 秒鐘)
    // delay 示範: 1
    // delay 示範: 2
    // delay 示範: 3
  }

  setDelayCode() {
    this.code = `
of(1, 2, 3).pipe(
  delay(1000)
).subscribe(data => {
  console.log(\`delay 示範: \${data}\`);
});`;
    this.diagram = `
(123|)
delay(1000)
---(123|)`;
  }

  delayWhen() {
    const delayFn = (value) => {
      return of(value).pipe(delay((value % 2) * 2000));
    };

    interval(1000)
      .pipe(
        take(3),
        delayWhen((value) => delayFn(value))
      )
      .subscribe((data) => {
        console.log(`delayWhen 示範 (1): ${data}`);
      });
    // delayWhen 示範 (1): 0
    // (原本應該發生事件 1，但被延遲了)
    // delayWhen 示範 (1): 2
    // delayWhen 示範 (1): 1
  }

  setDelayWhenCode() {
    this.code = `    
const delayFn = (value) => {
  return of(value).pipe(delay(value % 2 * 2000));
}

interval(1000).pipe(
  take(3),
  delayWhen(value => delayFn(value))
).subscribe(data => {
  console.log(\`delayWhen 示範 (1): \${data}\`);
});`;
    this.diagram = `
    ----0----1----2|
    delayWhen(value => of(value).pipe(delay(value % 2 * 2000)))
    ----0---------2----1|`;
  }

  catchError() {
    interval(1000)
      .pipe(
        take(10),
        map((data) => {
          if (data % 2 === 0) {
            return data;
          } else {
            throw new Error('發生錯誤');
          }
        }),
        catchError((error) => {
          return interval(1000).pipe(take(5));
        }),
        map((data) => data * 2)
      )
      .subscribe({
        next: (data) => {
          console.log(`catchError 示範 (2): ${data}`);
        },
        error: (error) => {
          console.log(`catchError 示範 (2): 錯誤 - ${error}`);
        },
      });
    // catchError 示範 (2): 0
    // (這時候來源 Observable 發生錯誤，用另一個 Observable 取代)
    // (以下是錯誤處理後新的 Observable)
    // catchError 示範 (2): 0
    // catchError 示範 (2): 2
    // catchError 示範 (2): 4
  }

  setCatchErrorCode() {
    this.code = `
interval(1000)
  .pipe(
    take(10),
    map((data) => {
      if (data % 2 === 0) {
        return data;
      } else {
        throw new Error('發生錯誤');
      }
    }),
    catchError((error) => {
      return interval(1000).pipe(take(5));
    }),
    map((data) => data * 2)
  )
  .subscribe({
    next: (data) => {
      console.log(\`catchError 示範 (2): \${data}\`);
    },
    error: (error) => {
      console.log(\`catchError 示範 (2): 錯誤 - \${error}\`);
    },
  });`;
    this.diagram = `
---0---#
catchError(---0---1---2...)
           ---0-------0----1----2...
                  ^ 發生錯誤，換成 catchError 內的 Observable
       map(data => data * 2)
           ---0-------0----2----4...`;
  }

  retry() {
    interval(1000)
      .pipe(
        switchMap((data) =>
          iif(
            () => data % 2 === 0,
            of(data),
            throwError(() => '發生錯誤')
          )
        ),
        map((data) => data + 1),
        retry(3)
      )
      .subscribe({
        next: (data) => {
          console.log(`retry 示範 (1): ${data}`);
        },
        error: (error) => {
          console.log(`retry 示範 (1): 錯誤 - ${error}`);
        },
      });
    // retry 示範 (1): 1
    // (發生錯誤，重試第 1 次)
    // retry 示範 (1): 1
    // (發生錯誤，重試第 2 次)
    // retry 示範 (1): 1
    // (發生錯誤，重試第 3 次)
    // retry 示範 (1): 1
    // (發生錯誤，已經重試 3 次了，不在重試，直接讓錯誤發生)
    // retry 示範 (1): 錯誤 - 發生錯誤
  }

  setRetryCode() {
    this.code = `
interval(1000)
.pipe(
  switchMap((data) =>
    iif(
      () => data % 2 === 0,
      of(data),
      throwError(() => '發生錯誤')
    )
  ),
  map((data) => data + 1),
  retry(3)
)
.subscribe({
  next: (data) => {
    console.log(\`retry 示範 (1): \${data}\`);
  },
  error: (error) => {
    console.log(\`retry 示範 (1): 錯誤 - \${error}\`);
  },
});`;
    this.diagram = `
---1---#
retry(3)
---1------1------1------1---#
       ^ 發生錯誤，重試第 1 次
              ^ 發生錯誤，重試第 2 次
                     ^ 發生錯誤，重試第 3 次
                            ^ 不重試，直接讓錯誤發生`;
  }

  retryWhen() {
    interval(1000)
      .pipe(
        switchMap((data) =>
          iif(
            () => data % 2 === 0,
            of(data),
            throwError(() => '發生錯誤')
          )
        ),
        map((data) => data + 1),
        retryWhen((error) => interval(3000).pipe(take(3)))
      )
      .subscribe({
        next: (data) => {
          console.log(`retryWhen 示範 (1): ${data}`);
        },
        error: (error) => {
          console.log(`retryWhen 示範 (1): 錯誤 - ${error}`);
        },
        complete: () => {
          console.log('retryWhen 示範 (1): 完成');
        },
      });
    // retryWhen 示範 (1): 1
    // retryWhen 示範 (1): 1
    // retryWhen 示範 (1): 1
    // (重試的 Observable 完成，因此整個 Observable 也完成)
    // retryWhen 示範 (1): 完成
  }

  setRetryWhenCode() {
    this.code = `
interval(1000)
.pipe(
  switchMap((data) =>
    iif(() => data % 2 === 0, of(data), throwError(() => '發生錯誤'))
  ),
  map((data) => data + 1),
  retryWhen((error) => interval(3000).pipe(take(3)))
)
.subscribe({
  next: (data) => {
    console.log(\`retryWhen 示範 (1): \${data}\`);
  },
  error: (error) => {
    console.log(\`retryWhen 示範 (1): 錯誤 - \${error}\`);
  },
  complete: () => {
    console.log('retryWhen 示範 (1): 完成');
  },
});`;
    this.diagram = `
-1-#
retryWhen(---0---1---2|)
   --0----1----2|
-1----1----1----|
   ^ 發生錯誤，三秒後重試
                ^ 重試的 Observable 完成，因此整個 Observable 也完成`;
  }

  finalize() {
    interval(1000)
      .pipe(
        finalize(() => {
          console.log('finalize 示範 (1): 在 pipe 內的 finalize 被呼叫了');
        }),
        take(5),
        map((data) => data + 1)
      )
      .subscribe({
        next: (data) => {
          console.log(`finalize 示範 (1): ${data}`);
        },
        complete: () => {
          console.log(`finalize 示範 (1): 完成`);
        },
      });
    // finalize 示範 (1): 1
    // finalize 示範 (1): 2
    // finalize 示範 (1): 3
    // finalize 示範 (1): 4
    // finalize 示範 (1): 5
    // finalize 示範 (1): 完成
    // finalize 示範 (1): 在 pipe 內的 finalize 被呼叫了
  }

  setFinalizeCode() {
    this.code = `
interval(1000)
.pipe(
  take(5),
  finalize(() => {
    console.log('finalize 示範 (1): 在 pipe 內的 finalize 被呼叫了');
  }),
  map((data) => data + 1)
)
.subscribe({
  next: (data) => {
    console.log(\`finalize 示範 (1): \${data}\`);
  },
  complete: () => {
    console.log(\`finalize 示範 (1): 完成\`);
  },
});`;
    this.diagram = ``;
  }
}
